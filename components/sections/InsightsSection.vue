<template>
  <ClientOnly>
    <div v-if="isVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="relative h-48 bg-gradient-to-r from-[#2A6967] to-[#1B4D4B] overflow-hidden">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 p-8 h-full flex flex-col justify-end">
            <h2 class="text-4xl font-bold text-white mb-2">Financial Insights</h2>
            <p class="text-white/90">Discover patterns in your financial behavior</p>
          </div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
        </div>
        
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-[#f8f8f8] rounded-xl p-6">
              <h3 class="text-xl font-semibold text-[#1B4D4B] mb-4">Monthly Summary</h3>
              <p class="text-gray-600">Your spending patterns show consistent improvement over the past three months.</p>
            </div>
            
            <div class="bg-[#f8f8f8] rounded-xl p-6">
              <h3 class="text-xl font-semibold text-[#1B4D4B] mb-4">Recommendations</h3>
              <p class="text-gray-600">Consider increasing your emergency fund contributions based on your current savings rate.</p>
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
  return sections.value.find(s => s.id === 'insights')?.isVisible ?? false
})
</script>