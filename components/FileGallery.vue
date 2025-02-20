<template>
  <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div v-for="file in filesList" :key="file.id" class="bg-white p-6 flex flex-col border-4 border-gray-100">
      <div class="mb-4">
        <span class="font-normal text-black" :title="file.filename">
          {{ file.filename }}
        </span>
      </div>
      <div class="space-y-2 font-light text-sm text-gray-600">
        <div class="flex justify-between">
          <span>Uploaded</span>
          <span>{{ formatDate(file.uploadDate) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Size</span>
          <span>{{ formatFileSize(file.size) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Transactions</span>
          <span>{{ file.transactionCount }}</span>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-4">
        <button 
          @click="viewFile(file)"
          :class="[
            'px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap',
            'bg-gray-100 text-[#1B4D4B] hover:bg-gray-200'
          ]"
        >
          View
        </button>
        <button 
          @click="confirmDelete(file)"
          :class="[
            'px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap',
            'bg-gray-100 text-[#1B4D4B] hover:bg-gray-200'
          ]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
  <UModal v-model="showDeleteModal">
    <div class="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <UCard :ui="{ base: 'w-[400px]' }">
        <div class="p-6">
          <h3 class="text-lg font-normal mb-2">Confirm Delete</h3>
          <p class="text-sm  text-gray-600 mb-6">
            Are you sure you want to delete this file? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-4">
            <button 
              @click="showDeleteModal = false"
              :class="[
                'px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap',
                'bg-gray-100 text-[#1B4D4B] hover:bg-gray-200'
              ]"
            >
              Cancel
            </button>
            <button 
              @click="deleteFile"
              :class="[
                'px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap',
                'bg-[#1B4D4B] text-white hover:bg-[#2A6967]'
              ]"
            >
              Delete
            </button>
          </div>
        </div>
      </UCard>
    </div>
  </UModal>

  <UModal v-model="showViewModal">
    <div class="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <UCard class="w-[600px]">
        <div class="p-6 border-b">
          <h3 class="text-xl font-medium text-gray-900">
            Transaction Details for: {{ selectedFileToView?.filename }}
          </h3>
        </div>
        
        <div class="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table class="w-full">
            <thead>
              <tr class="border-b sticky top-0 bg-white">
                <th class="text-left py-3 px-6 font-medium text-gray-500">Date</th>
                <th class="text-left py-3 px-6 font-medium text-gray-500">Amount</th>
                <th class="text-left py-3 px-6 font-medium text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in fileTransactions" :key="transaction.id" class="border-b">
                <td class="py-3 px-6 text-black">{{ new Date(transaction.date).toLocaleString() }}</td>
                <td class="py-3 px-6 text-black">{{ transaction.amount.toFixed(2) }}</td>
                <td class="py-3 px-6 text-black">{{ transaction.description }}</td>
              </tr>
              <tr v-if="fileTransactions.length === 0">
                <td colspan="3" class="py-4 px-6 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-6 border-t bg-white">
          <div class="flex justify-end">
            <button
              @click="showViewModal = false"
              class="px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap bg-gray-100 text-[#1B4D4B] hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </UCard>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';
import type { File } from '~/composables/useDexie';

const { files, getTransactions } = useDexie();

interface FileTransaction {
  id: number;
  fileId: number;
  date: Date;
  amount: number;
  description: string;
}

const filesList = ref<File[]>([]);
const showDeleteModal = ref(false);
const selectedFile = ref<File | null>(null);
const showViewModal = ref(false);
const fileTransactions = ref<FileTransaction[]>([]);
const selectedFileToView = ref<File | null>(null);

// Load files when component mounts
onMounted(async () => {
  await loadFiles();
});

// Watch for changes in the files table
watch(files, async () => {
  await loadFiles();
}, { deep: true });

async function loadFiles() {
  filesList.value = await files.toArray();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function formatFileSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

async function viewFile(file: File) {
  selectedFileToView.value = file;
  await loadFileTransactions(file.id!);
  showViewModal.value = true;
}

async function loadFileTransactions(fileId: number) {
  const allTransactions = (await getTransactions()) as FileTransaction[];
  fileTransactions.value = allTransactions.filter(transaction => transaction.fileId === fileId);
}

function confirmDelete(file: File) {
  selectedFile.value = file;
  showDeleteModal.value = true;
}

async function deleteFile() {
  if (selectedFile.value?.id) {
    await files.delete(selectedFile.value.id);
    await loadFiles();
    showDeleteModal.value = false;
    selectedFile.value = null;
  }
}
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1B4D4B;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2A6967;
}
</style> 