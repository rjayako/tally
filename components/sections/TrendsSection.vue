<template>
  <ClientOnly>
    <div v-if="isTrendsSectionVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out">
        <!-- Header - Made smaller -->
        <div class="relative h-32 bg-gradient-to-r from-[#1B4D4B] to-[#2A6967] overflow-hidden">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 p-6 h-full flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-white">Your Financial Trends</h2>
          </div>
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
        </div>

        <!-- Content Section -->
        <div class="p-6">
          <!-- Trend Type Buttons -->
          <div class="flex flex-wrap gap-3 mb-6">
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

          <!-- Bar Chart -->
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
              
              <!-- Chart container -->
              <div v-else class="w-full h-full relative">
                <!-- Y-axis labels -->
                <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <div>${{ formatValue(yAxisLabels[0]) }}</div>
                  <div>${{ formatValue(yAxisLabels[1]) }}</div>
                  <div>${{ formatValue(yAxisLabels[2]) }}</div>
                  <div>${{ formatValue(yAxisLabels[3]) }}</div>
                  <div>${{ formatValue(yAxisLabels[4]) }}</div>
                </div>
                
                <!-- Grid lines -->
                <div class="absolute left-8 right-0 top-0 h-full flex flex-col justify-between">
                  <div v-for="i in 5" :key="i" class="w-full h-px bg-gray-200"></div>
                </div>
                
                <!-- Bars container -->
                <div class="absolute left-10 right-0 bottom-6 top-0 flex items-end justify-around">
                  <!-- Bar groups -->
                  <div v-for="(label, index) in chartLabels" :key="index" 
                       class="flex items-end justify-center gap-1 group relative h-full"
                       :class="{'w-14': activeTab !== 'overlap', 'w-20': activeTab === 'overlap'}">
                    
                    <!-- Income bar -->
                    <div v-if="activeTab === 'income' || activeTab === 'overlap'"
                         :style="`height: ${incomeData[index]}%;`" 
                         class="w-full max-w-10 bg-emerald-500 rounded-t-md transition-all duration-500 ease-out group-hover:brightness-110 relative min-h-[2px]"
                         :class="{'w-8': activeTab === 'overlap'}">
                      <!-- Tooltip -->
                      <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Income: ${{ formatValue(getIncomeTooltipValue(index)) }}
                      </div>
                    </div>
                    
                    <!-- Expense bar -->
                    <div v-if="activeTab === 'expense' || activeTab === 'overlap'"
                         :style="`height: ${expenseData[index]}%;`" 
                         class="w-full max-w-10 bg-rose-500 rounded-t-md transition-all duration-500 ease-out group-hover:brightness-110 relative min-h-[2px]"
                         :class="{'w-8': activeTab === 'overlap'}">
                      <!-- Tooltip -->
                      <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-rose-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Expense: ${{ formatValue(getExpenseTooltipValue(index)) }}
                      </div>
                    </div>
                    
                    <!-- X-axis label -->
                    <span class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useDexie, type Transaction } from '~/composables/useDexie'
import type { Section } from '~/stores/sections'
import { useSectionsStore } from '~/stores/sections'

const { sections } = useContentSections()
const { getTransactions } = useDexie()
const sectionsStore = useSectionsStore()

// Compute whether the trends section should be visible
const isTrendsSectionVisible = computed(() => {
  const trendsSection = sectionsStore.sections.find((section: Section) => section.id === 'trends')
  return trendsSection?.isVisible || false
})

// Track active tab
const activeTab = ref('income')

// Set active tab
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  // Fetch real data based on the active tab
  fetchTransactionData()
}

// Computed chart title based on active tab
const chartTitle = computed(() => {
  switch (activeTab.value) {
    case 'income': return 'Income Trends (Last 6 Months)'
    case 'expense': return 'Expense Trends (Last 6 Months)'
    case 'overlap': return 'Income vs Expense Comparison'
    default: return 'Financial Trends'
  }
})

// Chart data
const loading = ref(false)
const error = ref<string | null>(null)
const incomeData = ref<number[]>([])
const expenseData = ref<number[]>([])
const chartLabels = ref<string[]>([])
const rawIncomeValues = ref<number[]>([])
const rawExpenseValues = ref<number[]>([])
const maxChartValue = ref(0)

// Computed Y-axis labels based on the maximum value
const yAxisLabels = computed(() => {
  // Add 20% buffer to the top of the chart
  let max = maxChartValue.value * 1.2
  
  // More fine-grained rounding logic
  const log10 = Math.floor(Math.log10(max))
  const magnitude = 10 ** (log10 - 1)  // Use one order of magnitude smaller
  
  // Round to the nearest multiple of 1, 2, or 5 times the magnitude
  if (max <= 2 * magnitude * 10) {
    max = Math.ceil(max / (magnitude * 2)) * (magnitude * 2)
  } else if (max <= 5 * magnitude * 10) {
    max = Math.ceil(max / (magnitude * 5)) * (magnitude * 5)
  } else {
    max = Math.ceil(max / (magnitude * 10)) * (magnitude * 10)
  }
  
  return [
    max,
    max * 0.75,
    max * 0.5,
    max * 0.25,
    0
  ]
})

// Format currency values
const formatValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
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
    
    // Process transactions for the last 6 months
    const today = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(today.getMonth() - 5) // -5 to include current month
    sixMonthsAgo.setDate(1) // Start from the 1st day of the month
    sixMonthsAgo.setHours(0, 0, 0, 0)
    console.log('Date range:', { sixMonthsAgo, today })
    
    // Generate labels for the last 6 months
    const labels: string[] = []
    const monthlyIncomeData: Record<string, number[]> = {}
    const monthlyExpenseData: Record<string, number[]> = {}
    
    // Initialize data structures for the last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo)
      monthDate.setMonth(sixMonthsAgo.getMonth() + i)
      
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`
      const monthLabel = monthDate.toLocaleString('default', { month: 'short' })
      
      labels.push(monthLabel)
      monthlyIncomeData[monthKey] = []
      monthlyExpenseData[monthKey] = []
    }
    console.log('Month labels:', labels)
    
    // Filter and categorize transactions by month
    const filteredTransactions = transactions.filter(tx => {
      // Convert the transaction date to a Date object if it's not already
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
      console.log('Transaction date check:', { 
        original: tx.date, 
        converted: txDate, 
        isAfterStart: txDate >= sixMonthsAgo, 
        isBeforeEnd: txDate <= today 
      })
      return txDate >= sixMonthsAgo && txDate <= today
    })
    console.log('Filtered transactions:', filteredTransactions)
    
    // Separate income and expense transactions
    filteredTransactions.forEach(tx => {
      // Convert the transaction date to a Date object if it's not already
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
      const monthKey = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`
      
      console.log('Processing transaction:', { 
        id: tx.id, 
        date: txDate, 
        monthKey, 
        amount: tx.amount, 
        isIncome: tx.amount > 0 
      })
      
      // Skip if the month is not in our range
      if (!monthlyIncomeData[monthKey]) {
        console.log('Month not in range:', monthKey)
        return
      }
      
      // Positive amounts are income, negative are expenses
      if (tx.amount > 0) {
        monthlyIncomeData[monthKey].push(tx.amount)
      } else if (tx.amount < 0) {
        // Store expense as positive value for easier calculation
        monthlyExpenseData[monthKey].push(Math.abs(tx.amount))
      }
    })
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
    
    // Store raw values for tooltips
    rawIncomeValues.value = monthlyIncomeTotals
    rawExpenseValues.value = monthlyExpenseTotals
    
    // Find the maximum value for normalization
    const maxValue = Math.max(
      ...monthlyIncomeTotals, 
      ...monthlyExpenseTotals,
      1 // Ensure we don't divide by zero
    )
    console.log('Max value for normalization:', maxValue)
    
    // Store the max value for Y-axis labels
    maxChartValue.value = maxValue
    
    // Normalize values to percentages (0-100)
    // Add 20% buffer to the normalization calculation and use the same rounded max value
    const normalizedMax = yAxisLabels.value[0]
    incomeData.value = monthlyIncomeTotals.map(value => (value / normalizedMax) * 100)
    expenseData.value = monthlyExpenseTotals.map(value => (value / normalizedMax) * 100)
    chartLabels.value = labels
    console.log('Final chart data:', { 
      incomeData: incomeData.value, 
      expenseData: expenseData.value, 
      chartLabels: chartLabels.value 
    })
    
    loading.value = false
  } catch (err) {
    console.error('Error fetching transaction data:', err)
    error.value = 'Failed to load chart data'
    loading.value = false
  }
}

// Update tooltip to show actual values instead of percentages
const getIncomeTooltipValue = (index: number): number => {
  return rawIncomeValues.value[index] || 0
}

const getExpenseTooltipValue = (index: number): number => {
  return rawExpenseValues.value[index] || 0
}

// Initialize chart with real data
onMounted(() => {
  fetchTransactionData()
})
</script>