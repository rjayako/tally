<template>
  <ClientOnly>
    <div v-if="isTrendsSectionVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out">
        <!-- Header - Made smaller -->
        <div class="relative h-25 bg-gradient-to-r from-[#1B4D4B] to-[#2A6967] overflow-hidden">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 p-6 h-full flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-white">Your Financial Trends</h2>
          </div>
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
        </div>

        <!-- Content Section -->
        <div class="p-6">
          <!-- Date Range Controls -->
          <div class="flex flex-wrap items-center justify-between mb-6">
            <div class="flex flex-wrap gap-3">
              <button 
                @click="setActiveTab('income')" 
                class="group flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium transition-all duration-300 border text-sm"
                :class="activeTab === 'income' 
                  ? 'bg-[#1B4D4B] text-white border-[#1B4D4B] shadow-md' 
                  : 'bg-white text-[#1B4D4B] border-[#1B4D4B]/20 hover:border-[#1B4D4B]/50 hover:bg-[#1B4D4B]/5'"
              >
                <Icon 
                  name="heroicons:arrow-trending-up" 
                  class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                  :class="activeTab === 'income' ? 'text-white' : 'text-emerald-500'" 
                />
                Income Trends
              </button>
              <button 
                @click="setActiveTab('expense')" 
                class="group flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium transition-all duration-300 border text-sm"
                :class="activeTab === 'expense' 
                  ? 'bg-[#1B4D4B] text-white border-[#1B4D4B] shadow-md' 
                  : 'bg-white text-[#1B4D4B] border-[#1B4D4B]/20 hover:border-[#1B4D4B]/50 hover:bg-[#1B4D4B]/5'"
              >
                <Icon 
                  name="heroicons:arrow-trending-down" 
                  class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                  :class="activeTab === 'expense' ? 'text-white' : 'text-rose-500'" 
                />
                Expense Trends
              </button>
              <button 
                @click="setActiveTab('overlap')" 
                class="group flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium transition-all duration-300 border text-sm"
                :class="activeTab === 'overlap' 
                  ? 'bg-[#1B4D4B] text-white border-[#1B4D4B] shadow-md' 
                  : 'bg-white text-[#1B4D4B] border-[#1B4D4B]/20 hover:border-[#1B4D4B]/50 hover:bg-[#1B4D4B]/5'"
              >
                <Icon 
                  name="heroicons:chart-bar" 
                  class="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                  :class="activeTab === 'overlap' ? 'text-white' : 'text-amber-500'" 
                />
                Overlap Trends
              </button>
            </div>
            
            <!-- Date Range Selector -->
            <div class="flex items-center gap-3 mt-3 sm:mt-0">
              <USelect
                v-model="selectedDateRange"
                :options="dateRangeOptions"
                placeholder="Select date range"
                class="w-40 text-sm"
                @update:model-value="handleDateRangeChange"
              />
              
              <div class="flex items-center gap-1">
                <UButton
                  icon="i-heroicons-chevron-left"
                  color="gray"
                  variant="ghost"
                  size="sm"
                  :disabled="!canNavigateBackward"
                  @click="navigateBackward"
                  class="px-1"
                />
                <UButton
                  icon="i-heroicons-chevron-right"
                  color="gray"
                  variant="ghost"
                  size="sm"
                  :disabled="!canNavigateForward"
                  @click="navigateForward"
                  class="px-1"
                />
              </div>
            </div>
          </div>

          <!-- Chart Container -->
          <div class="bg-[#f8f8f8] rounded-xl p-6 h-96 mt-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-[#1B4D4B]">{{ chartTitle }}</h3>
              <div v-if="activeTab === 'overlap'" class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span class="text-gray-700">Income</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span class="text-gray-700">Expense</span>
                </div>
              </div>
            </div>
            
            <div class="h-72 w-full flex items-center justify-center">
              <!-- Loading and error states -->
              <div v-if="loading" class="flex flex-col items-center justify-center text-gray-500">
                <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mb-2" />
                <span>Loading trend data...</span>
              </div>
              <div v-else-if="error" class="text-red-500 flex items-center gap-2">
                <Icon name="heroicons:exclamation-circle" class="w-5 h-5" />
                {{ error }}
              </div>
              
              <!-- Chart.js container -->
              <div v-else class="w-full h-full">
                <canvas ref="chartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useDexie, type Transaction, type Account } from '~/composables/useDexie'
import type { Section } from '~/stores/sections'
import { useSectionsStore } from '~/stores/sections'

const { sections } = useContentSections()
const { getTransactions, db } = useDexie()
const sectionsStore = useSectionsStore()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: any = null
const isClient = typeof window !== 'undefined'

// Compute whether the trends section should be visible
const isTrendsSectionVisible = computed(() => {
  const trendsSection = sectionsStore.sections.find((section: Section) => section.id === 'trends')
  return trendsSection?.isVisible || false
})

// Track active tab
const activeTab = ref('income')

// Date range options
const dateRangeOptions = [
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '1 Year', value: 12 },
  { label: '2 Years', value: 24 }
]

// Selected date range
const selectedDateRange = ref(6) // Default to 6 months

// Current date range boundaries
const endDate = ref(new Date())
const startDate = ref(new Date())

// Navigation control
const canNavigateBackward = ref(true)
const canNavigateForward = ref(false)

// Initialize date range
const initializeDateRange = () => {
  endDate.value = new Date()
  updateStartDate()
}

// Update start date based on selected range
const updateStartDate = () => {
  startDate.value = new Date(endDate.value)
  startDate.value.setMonth(endDate.value.getMonth() - (selectedDateRange.value - 1))
  startDate.value.setDate(1) // Start from the 1st day of the month
  startDate.value.setHours(0, 0, 0, 0)
  
  // Update navigation controls
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  canNavigateForward.value = endDate.value < today
}

// Handle date range change
const handleDateRangeChange = () => {
  updateStartDate()
  fetchTransactionData()
}

// Navigate backward in time
const navigateBackward = () => {
  endDate.value = new Date(startDate.value)
  endDate.value.setDate(0) // Last day of previous month
  updateStartDate()
  fetchTransactionData()
}

// Navigate forward in time
const navigateForward = () => {
  const newEndDate = new Date(endDate.value)
  newEndDate.setMonth(endDate.value.getMonth() + selectedDateRange.value)
  
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  // Don't go beyond today
  if (newEndDate > today) {
    endDate.value = today
  } else {
    endDate.value = newEndDate
  }
  
  updateStartDate()
  fetchTransactionData()
}

// Set active tab
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  // Fetch real data based on the active tab
  fetchTransactionData()
}

// Computed chart title based on active tab and date range
const chartTitle = computed(() => {
  const dateRangeText = selectedDateRange.value === 1 
    ? 'Last Month' 
    : `Last ${selectedDateRange.value} Months`
  
  switch (activeTab.value) {
    case 'income': return `Income Trends (${dateRangeText})`
    case 'expense': return `Expense Trends (${dateRangeText})`
    case 'overlap': return `Income vs Expense Comparison (${dateRangeText})`
    default: return 'Financial Trends'
  }
})

// Chart data
const loading = ref(false)
const error = ref<string | null>(null)
const rawIncomeValues = ref<number[]>([])
const rawExpenseValues = ref<number[]>([])
const chartLabels = ref<string[]>([])
const maxChartValue = ref(0)

// Format currency values
const formatValue = (value: number) => {
  // For zero or very small values, just return 0
  if (value < 1) return '0';
  
  // For larger values, use appropriate formatting
  if (value >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 1000000) + 'M';
  } else if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value / 1000) + 'K';
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}

// Format full currency values for tooltips
const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Helper function to get account information by accountId
 * @param accountId - The account ID to look up
 * @returns The account information or null if not found
 */
const getAccountById = async (accountId: number): Promise<Account | null> => {
  try {
    const account = await db.table('accounts').get(accountId)
    return account || null
  } catch (err) {
    console.error('Error fetching account:', err)
    return null
  }
}

/**
 * Determines if a transaction is income based on account type and amount
 * @param amount - The transaction amount
 * @param accountType - The account type ('credit' or 'debit')
 * @returns True if the transaction is income, false otherwise
 */
const isIncome = (amount: number, accountType: string): boolean => {
  // For debit cards, positive amounts are income
  // For credit cards, there is no income (all transactions are expenses)
  return accountType === 'debit' && amount > 0
}

/**
 * Determines if a transaction is an expense based on account type and amount
 * @param amount - The transaction amount
 * @param accountType - The account type ('credit' or 'debit')
 * @returns True if the transaction is an expense, false otherwise
 */
const isExpense = (amount: number, accountType: string): boolean => {
  // For debit cards, negative amounts are expenses
  // For credit cards, positive amounts are expenses
  return (accountType === 'debit' && amount < 0) || (accountType === 'credit' && amount > 0)
}

/**
 * Creates or updates the Chart.js chart
 */
const updateChart = () => {
  if (!chartCanvas.value) return
  
  // Import Chart.js only on client-side
  if (isClient) {
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }
    
    // Get Chart.js constructor
    // @ts-ignore - Ignore TypeScript error for Chart.js import
    const Chart = window.Chart
    
    // Prepare chart data based on active tab
    const datasets = []
    
    if (activeTab.value === 'income' || activeTab.value === 'overlap') {
      datasets.push({
        label: 'Income',
        data: rawIncomeValues.value,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: activeTab.value === 'overlap' ? 0.4 : 0.6,
        categoryPercentage: 0.8
      })
    }
    
    if (activeTab.value === 'expense' || activeTab.value === 'overlap') {
      datasets.push({
        label: 'Expenses',
        data: rawExpenseValues.value,
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: activeTab.value === 'overlap' ? 0.4 : 0.6,
        categoryPercentage: 0.8
      })
    }
    
    const data = {
      labels: chartLabels.value,
      datasets
    }
    
    // Chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => `$${formatValue(value)}`,
            count: 6,
            font: {
              size: 11
            },
            padding: 8
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          suggestedMax: function(context: any) {
            return context.max * 1.1;
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${formatFullCurrency(value)}`;
            }
          }
        },
        legend: {
          display: false,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
    
    // Create new chart
    chart = new Chart(chartCanvas.value, {
      type: 'bar',
      data,
      options
    })
  }
}

/**
 * Fetches transaction data from the database and processes it for the chart
 */
const fetchTransactionData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get all transactions from the database
    const transactions = await getTransactions()
    console.log('Fetched transactions:', transactions)
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions found in the database')
      error.value = 'No transaction data available'
      loading.value = false
      return
    }
    
    console.log('Date range:', { startDate: startDate.value, endDate: endDate.value })
    
    // Generate labels for the selected date range
    const labels: string[] = []
    const monthlyIncomeData: Record<string, number[]> = {}
    const monthlyExpenseData: Record<string, number[]> = {}
    
    // Initialize data structures for the selected months
    const months = selectedDateRange.value
    const currentStartDate = new Date(startDate.value)
    
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(currentStartDate)
      monthDate.setMonth(currentStartDate.getMonth() + i)
      
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`
      const monthLabel = monthDate.toLocaleString('default', { month: 'short' })
      
      if (i === 0 || i === months - 1 || months <= 12 || i % Math.ceil(months / 12) === 0) {
        // For longer periods, show fewer labels to avoid overcrowding
        // Always include the year in the label
        labels.push(`${monthLabel} ${monthDate.getFullYear()}`)
      } else {
        labels.push('')
      }
      
      monthlyIncomeData[monthKey] = []
      monthlyExpenseData[monthKey] = []
    }
    console.log('Month labels:', labels)
    
    // Filter and categorize transactions by month
    const filteredTransactions = transactions.filter(tx => {
      // Convert the transaction date to a Date object if it's not already
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
      return txDate >= startDate.value && txDate <= endDate.value
    })
    console.log('Filtered transactions:', filteredTransactions)
    
    // Process each transaction
    for (const tx of filteredTransactions) {
      // Convert the transaction date to a Date object if it's not already
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
      const monthKey = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`
      
      // Skip if the month is not in our range
      if (!monthlyIncomeData[monthKey]) {
        console.log('Month not in range:', monthKey)
        continue
      }
      
      // Get account information to determine if it's a credit or debit card
      const account = await getAccountById(tx.accountId)
      if (!account) {
        console.log('Account not found for transaction:', tx.id)
        continue
      }
      
      console.log('Processing transaction:', { 
        id: tx.id, 
        date: txDate, 
        monthKey, 
        amount: tx.amount,
        accountType: account.accountType
      })
      
      // Categorize as income or expense based on account type and amount
      if (isIncome(tx.amount, account.accountType)) {
        // Income is only for debit cards with positive amounts
        monthlyIncomeData[monthKey].push(tx.amount)
      } else if (isExpense(tx.amount, account.accountType)) {
        // Expense is for debit cards with negative amounts or credit cards with positive amounts
        // Store expense as positive value for easier calculation
        monthlyExpenseData[monthKey].push(Math.abs(tx.amount))
      }
    }
    console.log('Monthly data:', { monthlyIncomeData, monthlyExpenseData })
    
    // Calculate monthly totals
    const monthlyIncomeTotals: number[] = []
    const monthlyExpenseTotals: number[] = []
    
    Object.keys(monthlyIncomeData).sort().forEach(monthKey => {
      const incomeTotal = monthlyIncomeData[monthKey].reduce((sum, amount) => sum + amount, 0)
      const expenseTotal = monthlyExpenseData[monthKey].reduce((sum, amount) => sum + amount, 0)
      
      monthlyIncomeTotals.push(incomeTotal)
      monthlyExpenseTotals.push(expenseTotal)
    })
    console.log('Monthly totals:', { monthlyIncomeTotals, monthlyExpenseTotals })
    
    // Store raw values for chart
    rawIncomeValues.value = monthlyIncomeTotals
    rawExpenseValues.value = monthlyExpenseTotals
    chartLabels.value = labels
    
    // Find the maximum value for chart scaling
    // Ensure we have a reasonable minimum value to prevent tiny scales
    const minDisplayValue = 1000; // Set a minimum display value of $1,000
    maxChartValue.value = Math.max(
      ...monthlyIncomeTotals, 
      ...monthlyExpenseTotals,
      minDisplayValue // Ensure we don't have too small a scale
    )
    
    loading.value = false
    
    // Update the chart with new data
    nextTick(() => {
      updateChart()
    })
  } catch (err) {
    console.error('Error fetching transaction data:', err)
    error.value = 'Failed to load chart data'
    loading.value = false
  }
}

// Initialize date range and chart on component mount
onMounted(() => {
  initializeDateRange()
  fetchTransactionData()
  
  // Load Chart.js script
  if (isClient) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    script.onload = () => {
      fetchTransactionData()
    }
    document.head.appendChild(script)
  }
})

// Clean up chart on component unmount
onBeforeUnmount(() => {
  if (chart && isClient) {
    chart.destroy()
    chart = null
  }
})
</script>