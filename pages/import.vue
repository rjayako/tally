<template>
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Import Transactions CSV</h1>
    <textarea
      v-model="csvContent"
      placeholder="Paste your CSV content here..."
      class="w-full p-2 border rounded mb-4"
      rows="10"
    ></textarea>
    
    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">Card Type</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="config in cardConfigurations" :key="config.id" class="flex items-start">
          <input 
            type="radio" 
            :id="`card-${config.id}`" 
            v-model="selectedCardConfigId" 
            :value="config.id" 
            class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
          />
          <label :for="`card-${config.id}`" class="ml-2 text-sm font-medium text-gray-900">
            {{ config.name }}
            <span class="text-xs text-gray-500 block">{{ config.description }}</span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">Account Type</h2>
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input type="radio" v-model="accountType" value="credit" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
          <span class="ml-2">Credit Card</span>
        </label>
        <label class="inline-flex items-center">
          <input type="radio" v-model="accountType" value="debit" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500" />
          <span class="ml-2">Debit Card</span>
        </label>
      </div>
    </div>
    
    <button
      @click="handleImport"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >Import CSV</button>
    <p v-if="message" class="mt-4 text-lg" :class="{'text-green-600': !isError, 'text-red-600': isError}">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const csvContent = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);
const selectedCardConfigId = ref<string>('default');
const accountType = ref<string>('credit');

const { importTransactionCsv } = useDexie();
const { cardConfigurations } = useCardConfigurations();

async function handleImport() {
  if (!csvContent.value.trim()) {
    message.value = 'Please enter CSV content';
    isError.value = true;
    return;
  }
  
  try {
    await importTransactionCsv(
      csvContent.value, 
      'manual-import.csv', 
      accountType.value,
      selectedCardConfigId.value
    );
    message.value = 'CSV imported successfully!';
    isError.value = false;
  } catch (error: any) {
    console.error(error);
    message.value = error.message || 'Error importing CSV';
    isError.value = true;
  }
}
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style> 