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

    <div class="flex flex-col space-y-4 mb-4">
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Select Card Type</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="config in cardConfigurations" :key="config.id" class="flex items-start">
            <input 
              type="radio" 
              :id="`upload-card-${config.id}`" 
              v-model="selectedCardConfigId" 
              :value="config.id" 
              class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <label :for="`upload-card-${config.id}`" class="ml-2 text-sm font-medium text-gray-900">
              {{ config.name }}
              <span class="text-xs text-gray-500 block">{{ config.description }}</span>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Select Account Type</h3>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input type="radio" v-model="accountType" value="credit" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
            <span class="ml-2 text-sm">Credit Card</span>
          </label>
          <label class="inline-flex items-center">
            <input type="radio" v-model="accountType" value="debit" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
            <span class="ml-2 text-sm">Debit Card</span>
          </label>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center w-full">
      <label for="file-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
          <p class="text-xs text-gray-500">CSV files only</p>
        </div>
      </label>
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
  </div>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';
import { useCardConfigurations } from '~/composables/useCardConfigurations';

// Simple emit declaration
// @ts-ignore - Nuxt auto-imports
const emit = defineEmits(['chat-error']);

const { importTransactionCsv } = useDexie();
const { cardConfigurations } = useCardConfigurations();

// Local reactive state
const processing = ref(false);
const errorMessage = ref('');
const selectedFileLocal = ref<File | null>(null);
const selectedCardConfigId = ref<string>('default');
const accountType = ref<string>('credit');

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
    await importTransactionCsv(
      content, 
      file.name, 
      accountType.value,
      selectedCardConfigId.value
    );
    errorMessage.value = '';
  } catch (error: any) {
    console.error('Error processing file:', error);
    errorMessage.value = error.message || 'Error processing file';
  } finally {
    processing.value = false;
  }
}
</script>