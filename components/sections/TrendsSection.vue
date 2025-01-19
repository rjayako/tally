<template>
  <ClientOnly>
    <div v-if="isVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out">
        <!-- Header -->
        <div class="relative h-48 bg-gradient-to-r from-[#1B4D4B] to-[#2A6967] overflow-hidden">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 p-8 h-full flex flex-col justify-end">
            <h2 class="text-4xl font-bold text-white mb-2">Your Financial Trends</h2>
            <p class="text-white/90">Insights that matter, personalized for you</p>
          </div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
        </div>

        <!-- Content Grid -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Spending Pattern Card -->
            <div class="bg-[#f8f8f8] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-[#1B4D4B]">Spending Patterns</h3>
                <span class="text-[#2A6967]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
              </div>
              <p class="text-gray-600">Your spending has decreased by 12% compared to last month, showing improved financial habits.</p>
            </div>

            <!-- Savings Goals Card -->
            <div class="bg-[#f8f8f8] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-[#1B4D4B]">Savings Goals</h3>
                <span class="text-[#2A6967]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
              </div>
              <p class="text-gray-600">You're on track to reach your savings goal. Keep up the momentum!</p>
            </div>

            <!-- Investment Insights Card -->
            <div class="bg-[#f8f8f8] rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-[#1B4D4B]">Investment Insights</h3>
                <span class="text-[#2A6967]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p class="text-gray-600">Your investment portfolio shows a healthy diversification across multiple sectors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
const { sections } = useContentSections()

const isVisible = computed(() => {
  return sections.value.find(s => s.id === 'trends')?.isVisible ?? false
})
</script>