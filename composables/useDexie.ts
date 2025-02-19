import Dexie, { type Table } from "dexie";

// Define the Transaction interface based on the new CSV schema, with an added unique hash field
export interface Transaction {
  id?: number;
  date: Date;
  dateProcessed: Date;
  description: string;
  amount: number;
  accountId: number;
  categoryId: number | null;
  categoryName: string;
  hash: string;
  fileId: number;
}

// Define the Account interface for normalization
export interface Account {
  id?: number;
  cardMember: string;
  accountNumber: string;
}

// Define the File interface for tracking uploaded CSV files
export interface File {
  id?: number;
  filename: string;
  uploadDate: Date;
  hash: string;
  size: number;
  transactionCount: number;
}

// Update Dexie database to version 1 with enhanced category indexing
const db = new Dexie("tallyDB");

// Define schema with updated category indexing for case-insensitive search
db.version(2).stores({
  transactions: "++id,date,dateProcessed,amount,description,accountId,categoryId,categoryName,&hash,fileId",
  accounts: "++id,&accountNumber",
  files: "++id,filename,uploadDate,&hash"
});

// // Upgrade database to version 4 to add categoryId to transactions
// db.version(4).stores({
//   transactions: '++id,date,dateProcessed,amount,description,accountId,categoryId,&hash'
// });

// Access the tables
const transactions: Table<Transaction, number> = db.table("transactions");
const accounts: Table<Account, number> = db.table("accounts");
const files: Table<File, number> = db.table("files");

// A simple hash function (djb2 algorithm) to compute a unique hash from a string
function computeHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash.toString();
}

/**
 * Helper function to get an account by account number or create it if not found.
 * @param cardMember - The card member's name
 * @param accountNumber - The account number
 * @returns The id of the account
 */
async function getOrCreateAccountId(
  cardMember: string,
  accountNumber: string
): Promise<number> {
  const existing = await accounts.get({ accountNumber });
  if (existing && existing.id !== undefined) {
    return existing.id;
  }
  return await accounts.add({ cardMember, accountNumber });
}

/**
 * Helper function to get a category name from a transaction description using Vercel AI services.
 * Uses $fetch to call the '/api/ai-categorize' endpoint with the description.
 * @param description - The transaction description
 * @returns A category name as string
 */
async function getCategoryFromDescription(
  description: string
): Promise<string> {
  try {
    const result = await $fetch<{ category: string }>("/api/ai-categorize", {
      method: "POST",
      body: { description },
    });
    return result.category;
  } catch (error) {
    console.error("Error fetching category from Vercel AI:", error);
    return "Uncategorized";
  }
}

/**
 * Imports CSV data for transactions into the database.
 * Assumes CSV header: "Date,Date Processed,Description,Card Member,Account #,Amount"
 * Each row is parsed, a unique hash is computed, and the row is stored in the 'transactions' table with normalized account and categorized information.
 * If any transaction row already exists (based on the hash), an error is thrown to prevent duplicate uploads.
 * @param csvContent - The CSV file content as a string
 * @param filename - The name of the uploaded file
 */
export async function importTransactionCsv(csvContent: string, filename: string): Promise<void> {
  // Split CSV into lines and filter out empty lines
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return; // No data

  // Parse header (optional validation)
  const header = lines[0].split(",").map((h) => h.trim());
  const expectedHeader = [
    "Date",
    "Date Processed",
    "Description",
    "Card Member",
    "Account #",
    "Amount",
  ];
  // Optionally, validate header here
  // Normalize CSV content by replacing CRLF with LF, trimming each line, and removing empty lines
  const normalizedCsv = csvContent
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .join("\n");
  // Compute a file-level hash from normalized CSV content to uniquely identify the CSV file
  const fileHash = computeHash(normalizedCsv);

  // Check if this CSV file has already been imported by looking for any transaction with a hash starting with fileHash
  const existingFile = await files.where("hash").equals(fileHash).first();
  if (existingFile) {
    throw new Error("This CSV file has already been uploaded.");
  }

  // Create a record in the files table
  const fileId = await files.add({
    filename,
    uploadDate: new Date(),
    hash: fileHash,
    size: new Blob([csvContent]).size,
    transactionCount: lines.length - 1 // Subtract header row
  });

  // Collect CSV rows along with computed hash
  const rows: Array<{
    dateStr: string;
    dateProcessedStr: string;
    description: string;
    cardMember: string;
    accountNumber: string;
    amountStr: string;
    hash: string;
    fileId: number;
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((col) => col.trim());
    if (cols.length !== expectedHeader.length) continue; // Skip malformed rows

    const [
      dateStr,
      dateProcessedStr,
      description,
      cardMember,
      accountNumber,
      amountStr,
    ] = cols;
    // Compute base hash from concatenated row data
    const hashInput =
      dateStr +
      dateProcessedStr +
      description +
      cardMember +
      accountNumber +
      amountStr;
    const baseHash = computeHash(hashInput);
    // Append fileHash and row index to ensure uniqueness even for duplicate rows
    const finalHash = `${fileHash}_${i}_${baseHash}`;

    rows.push({
      dateStr,
      dateProcessedStr,
      description,
      cardMember,
      accountNumber,
      amountStr,
      hash: finalHash,
      fileId
    });
  }

  // Insert each transaction row without categorization (set categoryId to null)
  for (const row of rows) {
    const accountId = await getOrCreateAccountId(
      row.cardMember,
      row.accountNumber
    );
    await transactions.put({
      date: new Date(row.dateStr),
      dateProcessed: new Date(row.dateProcessedStr),
      description: row.description.replace(/\s+/g, " ").trim(),
      amount: parseFloat(row.amountStr),
      accountId,
      categoryId: null,
      categoryName: "Uncategorized",
      hash: row.hash,
      fileId
    });
  }
  await updateUncategorizedTransactions();
}

// New function to batch update uncategorized transactions using AI categorization
/**
 * Batch updates uncategorized transactions by calling AI-based categorization.
 * It queries the transactions table for rows with a null categoryId,
 * sends their id and description in a single batch request to the /api/ai-categorize endpoint,
 * and then updates each transaction with the corresponding category foreign key.
 */
export async function updateUncategorizedTransactions(): Promise<void> {
  const uncategorized = await transactions
    .filter((tx) => tx.categoryId === null)
    .toArray();
  if (uncategorized.length === 0) return;

  const payload = uncategorized.map((tx) => ({
    id: tx.id,
    description: tx.description.replace(/\s+/g, " ").trim(),
  }));
  console.log("payload", payload);
  try {
    const results = await $fetch<Array<{ id: number; category: string }>>(
      "/api/ai-categorize",
      {
        method: "POST",
        body: { transactions: payload },
      }
    );

    const updatePromises = results.map(async (res) => {
      if (res && res.id != null) {
        return transactions.update(res.id, { categoryName: res.category });
      }
    });
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating uncategorized transactions", error);
  }
}

/**
 * Retrieves all transaction records from the database.
 * @returns An array of Transaction objects
 */
export async function getTransactions(): Promise<Transaction[]> {
  return await transactions.toArray();
}

/**
 * Composable to use Dexie database functions easily.
 * @returns The helper functions and the db instance
 */
export function useDexie() {
  return {
    importTransactionCsv,
    getTransactions,
    db,
    files
  };
}
