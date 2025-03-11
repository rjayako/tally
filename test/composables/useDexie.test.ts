import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDexie } from '~/composables/useDexie'
import 'fake-indexeddb/auto'

// Mock the useCardConfigurations composable
vi.mock('~/composables/useCardConfigurations', () => ({
  useCardConfigurations: () => ({
    cardConfigurations: [
      {
        id: 'default',
        name: 'Default',
        description: 'Standard CSV format',
        csvMapping: {
          date: 0,
          dateProcessed: 1,
          description: 2,
          amount: 3,
          cardMember: 4,
          accountNumber: 5,
        },
        dateFormat: 'MM/DD/YYYY',
        amountMultiplier: 1,
        amountIsNegative: false,
      },
    ],
  }),
}))

describe('useDexie', () => {
  beforeEach(async () => {
    // Clear the database before each test
    const { useDexie } = await import('~/composables/useDexie')
    const { files } = useDexie()
    await files.clear()
  })

  it('imports CSV transactions correctly', async () => {
    const { importTransactionCsv, files, getTransactions } = useDexie()
    
    // Sample CSV content
    const csvContent = `01/01/2023,01/02/2023,Grocery Store,100.00,John Doe,1234
02/01/2023,02/02/2023,Gas Station,50.00,John Doe,1234`
    
    // Import the CSV
    await importTransactionCsv(csvContent, 'test.csv', 'credit', 'default')
    
    // Check if the file was added
    const allFiles = await files.toArray()
    expect(allFiles.length).toBe(1)
    expect(allFiles[0].filename).toBe('test.csv')
    expect(allFiles[0].transactionCount).toBe(2)
    
    // Check if the transactions were added
    const allTransactions = await getTransactions()
    expect(allTransactions.length).toBe(2)
    expect(allTransactions[0].description).toBe('Grocery Store')
    expect(allTransactions[0].amount).toBe(100)
    expect(allTransactions[1].description).toBe('Gas Station')
    expect(allTransactions[1].amount).toBe(50)
  })

  it('handles duplicate file imports', async () => {
    const { importTransactionCsv, files } = useDexie()
    
    // Sample CSV content
    const csvContent = `01/01/2023,01/02/2023,Grocery Store,100.00,John Doe,1234`
    
    // Import the CSV twice
    await importTransactionCsv(csvContent, 'test.csv', 'credit', 'default')
    await importTransactionCsv(csvContent, 'test.csv', 'credit', 'default')
    
    // Check if only one file was added (due to duplicate detection)
    const allFiles = await files.toArray()
    expect(allFiles.length).toBe(1)
  })

  it('handles different account types', async () => {
    const { importTransactionCsv, getTransactions } = useDexie()
    
    // Sample CSV content for credit and debit accounts
    const csvContent1 = `01/01/2023,01/02/2023,Grocery Store,100.00,John Doe,1234`
    const csvContent2 = `01/01/2023,01/02/2023,Restaurant,-50.00,Jane Doe,5678`
    
    // Import the CSVs with different account types
    await importTransactionCsv(csvContent1, 'credit.csv', 'credit', 'default')
    await importTransactionCsv(csvContent2, 'debit.csv', 'debit', 'default')
    
    // Check if the transactions were added with correct account types
    const allTransactions = await getTransactions()
    expect(allTransactions.length).toBe(2)
    
    // We can't directly check the account type from the transactions,
    // but we can verify they were processed correctly by checking the amounts
    // (assuming the implementation handles credit/debit correctly)
    expect(allTransactions.some(tx => tx.amount === 100)).toBe(true)
    expect(allTransactions.some(tx => tx.amount === -50)).toBe(true)
  })

  it('handles invalid CSV format', async () => {
    const { importTransactionCsv } = useDexie()
    
    // Invalid CSV content (missing columns)
    const csvContent = `01/01/2023,Grocery Store,100.00`
    
    // Expect an error when importing invalid CSV
    await expect(importTransactionCsv(csvContent, 'invalid.csv', 'credit', 'default'))
      .rejects.toThrow()
  })
}) 