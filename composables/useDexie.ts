import Dexie, { type Table } from "dexie";
import { useCardConfigurations, type CardConfiguration } from "./useCardConfigurations";

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
  accountType: string; // 'credit' or 'debit'
}

// Define the File interface for tracking uploaded CSV files
export interface File {
  id?: number;
  filename: string;
  uploadDate: Date;
  hash: string;
  size: number;
  transactionCount: number;
  cardConfigId?: string; // Add this field to store the card configuration ID
}

// Define the Section interface for storing application sections
export interface Section {
  id?: number;
  sectionId: string; // Original string ID from the application
  title: string;
  iconName: string;
  isVisible: boolean;
  isDraft: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the ChatMessage interface for storing chat messages
export interface ChatMessage {
  id?: number;
  messageId: string; // Original message ID
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  clientAction?: string; // Store the client action as a JSON string
}

// Update Dexie database to version 1 with enhanced category indexing
const db = new Dexie("tallyDB");

// Define schema with updated category indexing for case-insensitive search
db.version(2).stores({
  transactions: "++id,date,dateProcessed,amount,description,accountId,categoryId,categoryName,&hash,fileId",
  accounts: "++id,&accountNumber",
  files: "++id,filename,uploadDate,&hash"
});

// Upgrade database to version 3 to add accountType to accounts
db.version(3).stores({
  accounts: "++id,&accountNumber,accountType"
});

// Upgrade database to version 4 to add sections table
db.version(4).stores({
  transactions: "++id,date,dateProcessed,amount,description,accountId,categoryId,categoryName,&hash,fileId",
  accounts: "++id,&accountNumber,accountType",
  files: "++id,filename,uploadDate,&hash",
  sections: "++id,&sectionId,title,isVisible,isDraft,type,createdAt,updatedAt"
});

// Upgrade database to version 5 to add chat messages table
db.version(5).stores({
  transactions: "++id,date,dateProcessed,amount,description,accountId,categoryId,categoryName,&hash,fileId",
  accounts: "++id,&accountNumber,accountType",
  files: "++id,filename,uploadDate,&hash",
  sections: "++id,&sectionId,title,isVisible,isDraft,type,createdAt,updatedAt",
  chatMessages: "++id,&messageId,role,timestamp"
});

// Access the tables
const transactions: Table<Transaction, number> = db.table("transactions");
const accounts: Table<Account, number> = db.table("accounts");
const files: Table<File, number> = db.table("files");
const sections: Table<Section, number> = db.table("sections");
const chatMessages: Table<ChatMessage, number> = db.table("chatMessages");

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
 * @param accountType - The account type ('credit' or 'debit')
 * @returns The id of the account
 */
async function getOrCreateAccountId(
  cardMember: string,
  accountNumber: string,
  accountType: string = 'credit'
): Promise<number> {
  const existing = await accounts.get({ accountNumber });
  if (existing && existing.id !== undefined) {
    return existing.id;
  }
  return await accounts.add({ cardMember, accountNumber, accountType });
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
 * Uses the card configuration to map CSV columns to transaction fields.
 * @param csvContent - The CSV file content as a string
 * @param filename - The name of the uploaded file
 * @param accountType - The type of account ('credit' or 'debit')
 * @param cardConfigId - The ID of the card configuration to use for parsing
 */
export async function importTransactionCsv(
  csvContent: string, 
  filename: string, 
  accountType: string = 'credit',
  cardConfigId: string = 'default'
): Promise<void> {
  // Get the card configuration
  const { getCardConfigurationById } = useCardConfigurations();
  const cardConfig = getCardConfigurationById(cardConfigId);
  
  if (!cardConfig) {
    throw new Error(`Card configuration with ID '${cardConfigId}' not found.`);
  }

  // Split CSV into lines and filter out empty lines
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return; // No data

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
    transactionCount: lines.length - 1, // Subtract header row
    cardConfigId
  });

  // Collect CSV rows along with computed hash
  const rows: Array<{
    date: Date;
    dateProcessed: Date;
    description: string;
    cardMember: string;
    accountNumber: string;
    amount: number;
    hash: string;
    fileId: number;
  }> = [];

  // Skip the header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((col) => col.trim());
    
    // Extract values using the card configuration mapping
    const getValue = (field: keyof CardConfiguration['csvMapping'], cols: string[]): string => {
      const mapping = cardConfig.csvMapping[field];
      // If mapping is a number, use it as an index to get the value from cols
      // If mapping is a string, use it as a static value
      return typeof mapping === 'number' ? cols[mapping] : mapping.toString();
    };

    // Get values from CSV columns based on mapping
    const dateStr = getValue('date', cols);
    const dateProcessedStr = getValue('dateProcessed', cols);
    const description = getValue('description', cols);
    const cardMember = getValue('cardMember', cols);
    const accountNumber = getValue('accountNumber', cols);
    const amountStr = getValue('amount', cols);

    // Parse date values using custom parsers if available
    const parseDate = (value: string, field: 'date' | 'dateProcessed'): Date => {
      if (cardConfig.parsers?.[field]) {
        return cardConfig.parsers[field]!(value);
      }
      return new Date(value);
    };

    // Parse amount using custom parser if available
    const parseAmount = (value: string): number => {
      if (cardConfig.parsers?.amount) {
        return cardConfig.parsers.amount(value);
      }
      return parseFloat(value);
    };

    // Parse values
    const date = parseDate(dateStr, 'date');
    const dateProcessed = parseDate(dateProcessedStr, 'dateProcessed');
    const amount = parseAmount(amountStr);

    // Compute base hash from concatenated row data
    const hashInput = `${dateStr}${dateProcessedStr}${description}${cardMember}${accountNumber}${amountStr}`;
    const baseHash = computeHash(hashInput);
    // Append fileHash and row index to ensure uniqueness even for duplicate rows
    const finalHash = `${fileHash}_${i}_${baseHash}`;

    rows.push({
      date,
      dateProcessed,
      description,
      cardMember,
      accountNumber,
      amount,
      hash: finalHash,
      fileId
    });
  }

  // Insert each transaction row without categorization (set categoryId to null)
  for (const row of rows) {
    const accountId = await getOrCreateAccountId(
      row.cardMember,
      row.accountNumber,
      accountType
    );
    await transactions.put({
      date: row.date,
      dateProcessed: row.dateProcessed,
      description: row.description.replace(/\s+/g, " ").trim(),
      amount: row.amount,
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
 * Saves a section to the database.
 * If the section already exists (by sectionId), it will be updated.
 * @param section - The section to save
 * @returns The ID of the saved section
 */
export async function saveSection(section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  const existing = await sections.where('sectionId').equals(section.sectionId).first();
  
  if (existing) {
    // Update existing section
    const id = existing.id as number;
    await sections.update(id, {
      ...section,
      updatedAt: now
    });
    return id;
  } else {
    // Create new section
    return await sections.add({
      ...section,
      createdAt: now,
      updatedAt: now
    });
  }
}

/**
 * Retrieves all sections from the database.
 * @returns An array of Section objects
 */
export async function getSections(): Promise<Section[]> {
  return await sections.toArray();
}

/**
 * Updates the visibility of a section.
 * @param sectionId - The string ID of the section
 * @param isVisible - Whether the section should be visible
 */
export async function updateSectionVisibility(sectionId: string, isVisible: boolean): Promise<void> {
  const section = await sections.where('sectionId').equals(sectionId).first();
  if (section && section.id !== undefined) {
    await sections.update(section.id, { 
      isVisible, 
      updatedAt: new Date() 
    });
  }
}

/**
 * Deletes a section from the database.
 * @param sectionId - The string ID of the section to delete
 * @returns True if the section was deleted, false otherwise
 */
export async function deleteSection(sectionId: string): Promise<boolean> {
  const section = await sections.where('sectionId').equals(sectionId).first();
  if (section && section.id !== undefined) {
    await sections.delete(section.id);
    return true;
  }
  return false;
}

/**
 * Saves a chat message to the database
 * @param message Chat message to save
 * @returns ID of the saved message
 */
export async function saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
  // Check if message already exists by messageId
  const existingMessage = await chatMessages.where('messageId').equals(message.messageId).first();
  
  if (existingMessage) {
    // Update existing message
    await chatMessages.update(existingMessage.id!, message);
    return existingMessage.id!;
  } else {
    // Add new message
    return await chatMessages.add(message);
  }
}

/**
 * Retrieves all chat messages from the database
 * @returns Array of chat messages sorted by timestamp
 */
export async function getChatMessages(): Promise<ChatMessage[]> {
  return await chatMessages.orderBy('timestamp').toArray();
}

/**
 * Clears all chat messages from the database
 */
export async function clearChatMessages(): Promise<void> {
  await chatMessages.clear();
}

/**
 * Updates the type of a section in the database
 * @param sectionId - The string ID of the section
 * @param type - The new type for the section
 * @returns Promise that resolves when the operation is complete
 */
export async function updateSectionType(sectionId: string, type: string): Promise<void> {
  try {
    // Find the section by its sectionId
    const section = await sections.where('sectionId').equals(sectionId).first();
    
    if (section && section.id !== undefined) {
      // Update type and updatedAt timestamp
      await sections.update(section.id, {
        type,
        updatedAt: new Date()
      });
    } else {
      console.warn(`Section with ID ${sectionId} not found`);
    }
  } catch (error) {
    console.error(`Error updating section type for ${sectionId}:`, error);
    throw error;
  }
}

/**
 * Composable to use Dexie database functions easily.
 * @returns The helper functions and the db instance
 */
export function useDexie() {
  return {
    importTransactionCsv,
    getTransactions,
    saveSection,
    getSections,
    updateSectionVisibility,
    deleteSection,
    db,
    files,
    sections,
    chatMessages,
    saveChatMessage,
    getChatMessages,
    clearChatMessages,
    updateSectionType
  };
}
