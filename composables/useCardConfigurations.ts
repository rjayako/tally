// Define interfaces for card configuration
export interface CardConfiguration {
  id: string;
  name: string;
  description: string;
  csvMapping: {
    date: number | string;
    dateProcessed: number | string;
    description: number | string;
    cardMember: number | string;
    accountNumber: number | string;
    amount: number | string;
  };
  // Optional custom parsers for specific fields
  parsers?: {
    date?: (value: string) => Date;
    dateProcessed?: (value: string) => Date;
    amount?: (value: string) => number;
  };
}

// Create a composable to manage card configurations
export function useCardConfigurations() {
  // Default card configurations
  const cardConfigurations = ref<CardConfiguration[]>([
    // Credit Cards
    {
      id: 'default',
      name: 'Default Credit Card',
      description: 'Standard CSV format (Date,Date Processed,Description,Card Member,Account #,Amount)',
      csvMapping: {
        date: 0,
        dateProcessed: 1,
        description: 2,
        cardMember: 3,
        accountNumber: 4,
        amount: 5
      }
    },
    {
      id: 'amex',
      name: 'American Express',
      description: 'American Express CSV format (Date,Reference,Description,Amount)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Use the same date for processed
        description: 2,
        cardMember: 'American Express', // Static value
        accountNumber: 1, // Use reference as account number
        amount: 3
      },
      parsers: {
        // AMEX uses MM/DD/YYYY format
        date: (value: string) => {
          const [month, day, year] = value.split('/').map(Number);
          return new Date(year, month - 1, day);
        },
        // AMEX uses negative numbers for charges, positive for credits
        amount: (value: string) => -parseFloat(value) // Invert the sign
      }
    },
    {
      id: 'chase',
      name: 'Chase',
      description: 'Chase CSV format (Transaction Date,Post Date,Description,Category,Type,Amount)',
      csvMapping: {
        date: 0,
        dateProcessed: 1,
        description: 2,
        cardMember: 'Chase', // Static value
        accountNumber: 'Chase Card', // Static value
        amount: 5
      }
    },
    {
      id: 'discover',
      name: 'Discover',
      description: 'Discover CSV format (Trans. Date,Post Date,Description,Amount,Category)',
      csvMapping: {
        date: 0,
        dateProcessed: 1,
        description: 2,
        cardMember: 'Discover', // Static value
        accountNumber: 'Discover Card', // Static value
        amount: 3
      }
    },
    
    // Canadian Bank Debit Cards
    {
      id: 'rbc',
      name: 'RBC Royal Bank',
      description: 'RBC Debit CSV format (Account Type,Account Number,Transaction Date,Cheque Number,Description,CAD$,USD$)',
      csvMapping: {
        date: 2,
        dateProcessed: 2, // Same as transaction date
        description: 4,
        cardMember: 'RBC Client', // Static value
        accountNumber: 1,
        amount: 5 // CAD$ column
      },
      parsers: {
        // RBC uses YYYY/MM/DD format
        date: (value: string) => {
          const [year, month, day] = value.split('/').map(Number);
          return new Date(year, month - 1, day);
        },
        // RBC shows withdrawals as negative numbers
        amount: (value: string) => parseFloat(value)
      }
    },
    {
      id: 'td',
      name: 'TD Canada Trust',
      description: 'TD Debit CSV format (Date,Transaction,Name,Withdrawn,Deposited,Balance)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Same as transaction date
        description: 2,
        cardMember: 'TD Client', // Static value
        accountNumber: 'TD Account', // Static value
        amount: 3 // Use Withdrawn column (will be converted to negative)
      },
      parsers: {
        // TD uses MM/DD/YYYY format
        date: (value: string) => {
          const [month, day, year] = value.split('/').map(Number);
          return new Date(year, month - 1, day);
        },
        // TD shows withdrawals as positive in "Withdrawn" column, need to make negative
        amount: (value: string) => {
          const amount = parseFloat(value);
          return amount > 0 ? -amount : 0; // Convert withdrawals to negative
        }
      }
    },
    {
      id: 'scotiabank',
      name: 'Scotiabank',
      description: 'Scotiabank Debit CSV format (Date,Description,Debits,Credits,Balance)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Same as transaction date
        description: 1,
        cardMember: 'Scotiabank Client', // Static value
        accountNumber: 'Scotiabank Account', // Static value
        amount: 2 // Use Debits column (will be converted to negative)
      },
      parsers: {
        // Scotiabank uses YYYY-MM-DD format
        date: (value: string) => new Date(value),
        // Scotiabank shows debits as positive in "Debits" column, need to make negative
        amount: (value: string) => {
          const amount = parseFloat(value);
          return amount > 0 ? -amount : 0; // Convert debits to negative
        }
      }
    },
    {
      id: 'bmo',
      name: 'BMO Bank of Montreal',
      description: 'BMO Debit CSV format (Date Posted,Description,Amount,Account Balance)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Same as posted date
        description: 1,
        cardMember: 'BMO Client', // Static value
        accountNumber: 'BMO Account', // Static value
        amount: 2
      },
      parsers: {
        // BMO uses MM/DD/YYYY format
        date: (value: string) => {
          const [month, day, year] = value.split('/').map(Number);
          return new Date(year, month - 1, day);
        },
        // BMO already shows withdrawals as negative
        amount: (value: string) => parseFloat(value)
      }
    },
    {
      id: 'cibc',
      name: 'CIBC',
      description: 'CIBC Debit CSV format (Date,Description,Withdrawal,Deposit,Balance)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Same as transaction date
        description: 1,
        cardMember: 'CIBC Client', // Static value
        accountNumber: 'CIBC Account', // Static value
        amount: 2 // Use Withdrawal column (will be converted to negative)
      },
      parsers: {
        // CIBC uses DD/MM/YYYY format
        date: (value: string) => {
          const [day, month, year] = value.split('/').map(Number);
          return new Date(year, month - 1, day);
        },
        // CIBC shows withdrawals as positive in "Withdrawal" column, need to make negative
        amount: (value: string) => {
          const amount = parseFloat(value);
          return amount > 0 ? -amount : 0; // Convert withdrawals to negative
        }
      }
    },
    {
      id: 'tangerine',
      name: 'Tangerine Bank',
      description: 'Tangerine Debit CSV format (Date,Transaction,Name,Memo,Amount)',
      csvMapping: {
        date: 0,
        dateProcessed: 0, // Same as transaction date
        description: 2,
        cardMember: 'Tangerine Client', // Static value
        accountNumber: 'Tangerine Account', // Static value
        amount: 4
      },
      parsers: {
        // Tangerine uses YYYY-MM-DD format
        date: (value: string) => new Date(value),
        // Tangerine already shows withdrawals as negative
        amount: (value: string) => parseFloat(value)
      }
    }
  ]);

  // Function to get a card configuration by ID
  const getCardConfigurationById = (id: string): CardConfiguration | undefined => {
    return cardConfigurations.value.find(config => config.id === id);
  };

  // Function to add a new card configuration
  const addCardConfiguration = (config: CardConfiguration) => {
    // Check if configuration with this ID already exists
    const existingIndex = cardConfigurations.value.findIndex(c => c.id === config.id);
    if (existingIndex >= 0) {
      // Replace existing configuration
      cardConfigurations.value[existingIndex] = config;
    } else {
      // Add new configuration
      cardConfigurations.value.push(config);
    }
  };

  // Function to remove a card configuration
  const removeCardConfiguration = (id: string) => {
    const index = cardConfigurations.value.findIndex(c => c.id === id);
    if (index >= 0) {
      cardConfigurations.value.splice(index, 1);
    }
  };

  return {
    cardConfigurations,
    getCardConfigurationById,
    addCardConfiguration,
    removeCardConfiguration
  };
} 