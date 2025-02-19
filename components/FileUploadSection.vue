<template>
  <div class="mt-8 space-y-4">
    <div class="relative">
      <label 
        for="file-upload"
        :class="[
          'inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer shadow-sm',
          processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1B4D4B] hover:bg-[#2A6967]',
          'text-white'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ processing ? 'Processing...' : 'Upload Your Statement Securely' }}
      </label>
      <input 
        id="file-upload" 
        type="file" 
        class="hidden" 
        accept=".csv,.xlsx,.xls"
        @change="handleFileChange"
        :disabled="processing"
      >
    </div>

    <div v-if="errorMessage" class="text-red-600 text-sm mt-2">
      {{ errorMessage }}
    </div>

    <div v-if="selectedFileLocal && !errorMessage" class="text-sm text-green-600 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      File selected: {{ selectedFileLocal.name }}
    </div>

    <p class="text-sm text-gray-500">Supported formats: CSV, Excel (.xlsx, .xls)</p>
    
    <FileGallery />
  </div>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';

// Declare defineEmits for TypeScript, as it is auto-imported in Nuxt 3
declare const defineEmits: any;
const emit = defineEmits<{ (e: 'chat-error', message: string): void }>();

const { importTransactionCsv } = useDexie();

// Local reactive state
const processing = ref(false);
const errorMessage = ref('');
const selectedFileLocal = ref<File | null>(null);

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  selectedFileLocal.value = file;
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = 'Please upload a CSV file';
    return;
  }

  processing.value = true;
  errorMessage.value = '';

  try {
    const content = await file.text() as string;
    await importTransactionCsv(content, file.name);
    errorMessage.value = '';
  } catch (error: any) {
    console.error('Error processing file:', error);
    errorMessage.value = error.message || 'Error processing file';
  } finally {
    processing.value = false;
  }
}
</script>