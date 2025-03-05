<template>
  <div class="container mx-auto p-8 text-black">
    <h1 class="text-2xl font-bold mb-6">Database Debug</h1>
    
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Transactions</h2>
      <div v-if="loading" class="text-gray-500">Loading transactions...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else-if="transactions.length === 0" class="text-gray-500">No transactions found in the database.</div>
      <div v-else>
        <div class="mb-4 flex justify-between items-center">
          <span class="font-medium">Total transactions: {{ transactions.length }}</span>
          <div class="flex items-center gap-4">
            <select 
              v-model="itemsPerPage" 
              class="border rounded px-2 py-1 bg-white text-black"
            >
              <option :value="10">10 per page</option>
              <option :value="25">25 per page</option>
              <option :value="50">50 per page</option>
              <option :value="100">100 per page</option>
            </select>
            <div class="flex items-center gap-2">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <div class="max-h-[600px] overflow-y-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead class="sticky top-0 bg-white">
                <tr>
                  <th class="py-2 px-4 border-b text-left">ID</th>
                  <th class="py-2 px-4 border-b text-left">Date</th>
                  <th class="py-2 px-4 border-b text-left">Description</th>
                  <th class="py-2 px-4 border-b text-left">Amount</th>
                  <th class="py-2 px-4 border-b text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in paginatedTransactions" :key="tx.id" class="border-b hover:bg-gray-50">
                  <td class="py-2 px-4">{{ tx.id }}</td>
                  <td class="py-2 px-4">{{ new Date(tx.date).toLocaleDateString() }}</td>
                  <td class="py-2 px-4">{{ tx.description }}</td>
                  <td class="py-2 px-4" :class="tx.amount > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatAmount(tx.amount) }}
                  </td>
                  <td class="py-2 px-4">{{ tx.categoryName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Upload Test Transaction</h2>
      <button 
        @click="addTestTransaction" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        :disabled="addingTransaction"
      >
        {{ addingTransaction ? 'Adding...' : 'Add Test Transaction' }}
      </button>
      <div v-if="addSuccess" class="mt-2 text-green-600">
        Test transaction added successfully!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDexie, type Transaction } from '~/composables/useDexie'

const { getTransactions, db } = useDexie()

const transactions = ref<Transaction[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const addingTransaction = ref(false)
const addSuccess = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = computed(() => Math.ceil(transactions.value.length / itemsPerPage.value))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return transactions.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Format currency
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Load transactions
const loadTransactions = async () => {
  loading.value = true
  error.value = null
  
  try {
    transactions.value = await getTransactions()
    console.log('Loaded transactions:', transactions.value)
  } catch (err) {
    console.error('Error loading transactions:', err)
    error.value = 'Failed to load transactions'
  } finally {
    loading.value = false
  }
}

// Add a test transaction
const addTestTransaction = async () => {
  addingTransaction.value = true
  addSuccess.value = false
  
  try {
    // Create a test transaction
    const today = new Date()
    const testTransaction: Partial<Transaction> = {
      date: today,
      dateProcessed: today,
      description: 'Test Income Transaction',
      amount: 1000, // Positive for income
      accountId: 1,
      categoryId: null,
      categoryName: 'Test',
      hash: `test-${Date.now()}`,
      fileId: 1
    }
    
    // Add to database
    await db.table('transactions').add(testTransaction as Transaction)
    
    // Reload transactions
    await loadTransactions()
    addSuccess.value = true
  } catch (err) {
    console.error('Error adding test transaction:', err)
    error.value = 'Failed to add test transaction'
  } finally {
    addingTransaction.value = false
  }
}

// Load transactions on mount
onMounted(() => {
  loadTransactions()
})

// Add watcher for itemsPerPage
watch(itemsPerPage, () => {
  // Reset to first page when changing items per page
  currentPage.value = 1
})
</script> 