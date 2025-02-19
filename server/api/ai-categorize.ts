import { defineEventHandler, readBody, createError } from "h3";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Batch processing logic
  if (body.transactions && Array.isArray(body.transactions)) {
    // Validate transactions array items
    const transactions = body.transactions;
    if (
      !transactions.every(
        (tx: any) =>
          tx &&
          typeof tx.id !== "undefined" &&
          typeof tx.description === "string"
      )
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid transactions format",
      });
    }

    // Extract unique descriptions from transactions
    const uniqueDescriptions = [
      ...new Set(transactions.map((tx: any) => tx.description)),
    ];

    console.log("uniqueDescriptions", uniqueDescriptions);

    // Build prompt with transaction details
    let prompt = `For each element in the array provided return back a json object that includes the provided element and the category that best describes it. The categories can be things like Takeout, Coffee, Shopping, Grocery, Transportation, try to get granular if you can. Then take all the objects and return back a json array of all the objects. with the following format: [{"uniqueDescription": Provided element, "category": "General"}, {"uniqueDescription": Provided element, "category": "Takeout"}, {"uniqueDescription": Provided element, "category": "Coffee"}, {"uniqueDescription": Provided element, "category": "Shopping"}]
    Respond with ONLY the valid JSON array containing these objects, WITHOUT any markdown formatting (do not wrap it in triple backticks) or any additional text.
    
    Provided array: ${JSON.stringify(uniqueDescriptions)}`;

    console.log("prompt", prompt);

    try {
      const { object: resultObject } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          results: z.array(
            z.object({
              uniqueDescription: z.string().nonempty(),
              category: z.string().nonempty(),
            })
          ),
        }),
        prompt,
      });

      // Map transactions to categories based on matching descriptions
      const categorizedTransactions = body.transactions.map(
        (transaction: any) => {
          // Find matching result from AI categorization
          const matchingResult = resultObject.results.find(
            (result) => result.uniqueDescription === transaction.description
          );

          // Create new object with transaction ID and matched category
          return {
            id: transaction.id,
            category: matchingResult
              ? matchingResult.category
              : "Uncategorized",
          };
        }
      );
      console.log("categorizedTransactions", categorizedTransactions);
      
      return categorizedTransactions;
    } catch (error) {
      console.log("error", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to generate categories in batch mode",
      });
    }
  }

  // Fallback: single description processing
  const description = body.description;

  if (typeof description !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid description",
    });
  }

  const prompt = `Please categorize the following description into categories like: "General", "Takeout", "Coffee", "Shopping". You should respond with only the category name as a single word or two words maximum. Description: ${description}`;

  try {
    const { object: result } = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: z.object({
        category: z.string().nonempty(),
      }),
      prompt,
    });
    return result;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate category",
    });
  }
});
