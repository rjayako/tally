<template>
  <ClientOnly>
    <div v-if="isVisible" class="max-w-6xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-2xl font-semibold text-[#1B4D4B] mb-6">Welcome Ryan! 🎉</h1>
        
        <div class="space-y-6 text-gray-700">
          <div class="flex items-start space-x-3">
            <div class="mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#1B4D4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p><span class="font-medium">Your privacy and security come first:</span> We process all your financial data locally in your browser. Nothing is ever stored on our servers - it's just between you and your device.</p>
          </div>
          
          <p class="text-lg">Ready to experience a smarter way to manage your finances? Let's begin with your transaction statement - simply upload it below and watch as WealthLens transforms your financial data into actionable insights.</p>
          
          <div class="bg-[#f5f5f3] p-4 rounded-lg">
            <p class="text-[#1B4D4B] font-medium">💡 What makes WealthLens different?</p>
            <p class="mt-2">Unlike traditional budget tools that lock you into rigid systems, WealthLens adapts to you. Our AI assistant is here 24/7 in the chat - ask questions, get insights, or create custom reports. It's like having a personal financial advisor, but one that works exactly how you want it to.</p>
          </div>
        </div>

        <FileUploadSection 
          :is-processing="isProcessing"
          :error="error"
          :selected-file="selectedFile"
          @file-selected="handleFileUpload"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { useFileUpload } from '~/composables/useFileUpload'
import { useContentSections } from '~/composables/useContentSections'

const { selectedFile, isProcessing, error, handleFileSelect } = useFileUpload()
const { sections } = useContentSections()

const isVisible = computed(() => {
  return sections.value.find(s => s.id === 'welcome')?.isVisible ?? false
})

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    await handleFileSelect(file)
  }
}
</script>