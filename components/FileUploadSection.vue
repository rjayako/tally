<template>
  <div class="mt-8 space-y-4">
    <div class="relative">
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
      <input 
        id="file-upload" 
        type="file" 
        class="hidden" 
        accept=".csv,.xlsx,.xls"
        @change="$emit('file-selected', $event)"
        :disabled="isProcessing"
      >
    </div>

    <div v-if="error" class="text-red-600 text-sm mt-2">
      {{ error }}
    </div>

    <div v-if="selectedFile && !error" class="text-sm text-green-600 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      File selected: {{ selectedFile.name }}
    </div>

    <p class="text-sm text-gray-500">Supported formats: CSV, Excel (.xlsx, .xls)</p>
  </div>
</template>

<script setup>
defineProps({
  isProcessing: Boolean,
  error: String,
  selectedFile: File
})

defineEmits(['file-selected'])
</script>