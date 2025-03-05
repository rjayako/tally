<template>
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Import Transactions CSV</h1>
    <textarea
      v-model="csvContent"
      placeholder="Paste your CSV content here..."
      class="w-full p-2 border rounded mb-4"
      rows="10"
    ></textarea>
    <button
      @click="handleImport"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >Import CSV</button>
    <p v-if="message" class="mt-4 text-lg">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
const csvContent = ref<string>('');
const message = ref<string>('');

const { importTransactionCsv } = useDexie();

async function handleImport() {
  try {
    await importTransactionCsv(csvContent.value, 'manual-import.csv', 'credit');
    message.value = 'CSV imported successfully!';
  } catch (error: any) {
    console.error(error);
    message.value = error.message || 'Error importing CSV';
  }
}
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style> 