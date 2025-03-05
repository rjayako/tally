<template>
  <div class="mt-8 space-y-4">
    <input 
      id="file-upload" 
      type="file" 
      class="hidden" 
      accept=".csv,.xlsx,.xls"
      @change="handleFileChange"
      :disabled="processing"
    >

    <div v-if="errorMessage" class="text-red-600 text-sm mt-2">
      {{ errorMessage }}
    </div>

    <div v-if="selectedFileLocal && !errorMessage" class="text-sm text-green-600 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      File selected: {{ selectedFileLocal.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';

// Simple emit declaration
// @ts-ignore - Nuxt auto-imports
const emit = defineEmits(['chat-error']);

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