<template>
  <ClientOnly>
    <div v-if="isVisible" class="max-w-6xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <template v-if="fileCount > 0">
          <h1 class="text-2xl font-semibold text-[#1B4D4B] mb-6">Quick Summary</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg p-6 text-center shadow-sm border-2 border-gray-100">
              <div class="text-4xl font-bold text-[#1B4D4B] mb-2">{{ fileCount }}</div>
              <div class="text-gray-600">Files Uploaded</div>
            </div>
            <div class="bg-white rounded-lg p-6 text-center shadow-sm border-2 border-gray-100">
              <div class="text-4xl font-bold text-[#1B4D4B] mb-2">{{ transactionCount }}</div>
              <div class="text-gray-600">Total Transactions</div>
            </div>
            <div class="bg-white rounded-lg p-6 text-center shadow-sm border-2 border-gray-100">
              <div class="text-4xl font-bold text-[#1B4D4B] mb-2">{{ uniqueCategories.length }}</div>
              <div class="text-gray-600">Categories</div>
            </div>
          </div>
        </template>

        <div class="space-y-6 text-gray-700">
          <template v-if="fileCount === 0">
            <div class="text-center py-8 bg-[#f5f5f3] p-4 rounded-lg">
              <h2 class="text-2xl font-semibold text-[#1B4D4B] mb-4">Upload transactions to get started</h2>
              <p class="text-sm text-gray-500">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>
          </template>
          
        </div>

        <div class="text-center mt-8">
          <label 
            for="file-upload"
            :class="[
              'inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer shadow-sm',
              isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1B4D4B] hover:bg-[#2A6967]',
              'text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {{ isProcessing ? 'Processing...' : 'Upload Your Statement Securely' }}
          </label>
        </div>

        <FileUploadSection 
          :is-processing="isProcessing"
          :error="error"
          :selected-file="selectedFile"
          @file-selected="handleFileUpload"
          class="hidden"
        />

        <FileGallery />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useFileUpload } from '~/composables/useFileUpload'
import { useContentSections } from '~/composables/useContentSections'
import { useDexie } from '~/composables/useDexie'
import type { Section } from '~/stores/sections'

const { selectedFile, isProcessing, error, handleFileSelect } = useFileUpload()
const { sections } = useContentSections()
const { files, getTransactions } = useDexie()

const fileCount = ref(0)
const transactionCount = ref(0)
const uniqueCategories = ref<string[]>([])

const isVisible = computed(() => {
  return sections.value.find((s: Section) => s.id === 'welcome')?.isVisible ?? false
})

// Load statistics when component mounts
onMounted(async () => {
  await loadStatistics()
})

// Watch for changes in files to update statistics
watch(files, async () => {
  await loadStatistics()
}, { deep: true })

async function loadStatistics() {
  // Get files count
  const allFiles = await files.toArray()
  fileCount.value = allFiles.length
  
  // Get transactions and compute statistics
  const allTransactions = await getTransactions()
  transactionCount.value = allTransactions.length
  
  // Get unique categories
  uniqueCategories.value = [...new Set(allTransactions.map(tx => tx.categoryName))]
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await handleFileSelect(file)
  }
}
</script>