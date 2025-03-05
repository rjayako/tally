<template>
  <ClientOnly>
    <div v-if="isWelcomeSectionVisible" class="max-w-6xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <template v-if="fileCount > 0">
          <h1 class="text-2xl font-semibold text-[#1B4D4B] mb-6">Quick Summary</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-[#F3F4FF] rounded-lg p-6 text-center">
              <div class="text-4xl font-bold text-[#4F46E5] mb-2">{{ fileCount }}</div>
              <div class="text-gray-600">Files Uploaded</div>
            </div>
            <div class="bg-[#F0FDF4] rounded-lg p-6 text-center">
              <div class="text-4xl font-bold text-[#16A34A] mb-2">{{ transactionCount }}</div>
              <div class="text-gray-600">Total Transactions</div>
            </div>
            <div class="bg-[#FFF7ED] rounded-lg p-6 text-center">
              <div class="text-4xl font-bold text-[#EA580C] mb-2">{{ uniqueCategories.length }}</div>
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
import { useSectionsStore } from '~/stores/sections'

const { selectedFile, isProcessing, error, handleFileSelect } = useFileUpload()
const { sections } = useContentSections()
const { files, getTransactions } = useDexie()

// Get the sections store
const sectionsStore = useSectionsStore()

const fileCount = ref(0)
const transactionCount = ref(0)
const uniqueCategories = ref<string[]>([])

// Compute whether the welcome section should be visible
const isWelcomeSectionVisible = computed(() => {
  const welcomeSection = sectionsStore.sections.find((section: Section) => section.id === 'welcome')
  return welcomeSection?.isVisible || false
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