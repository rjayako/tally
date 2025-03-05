<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Files Uploaded</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div v-for="file in filesList" :key="file.id" class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ file.filename }}</h3>
          <div class="space-y-2 text-sm text-slate-600">
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
        </div>
        <div class="bg-slate-50 px-6 py-3 flex justify-between">
          <button 
            @click="viewFile(file)"
            class="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
            View
          </button>
          <button 
            @click="confirmDelete(file)"
            class="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
      
      <!-- Upload Card -->
      <div 
        @click="handleUpload"
        class="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors cursor-pointer"
      >
        <Icon name="lucide:upload" class="w-6 h-6 mb-2" />
        <p>Upload New File</p>
      </div>
    </div>
    
    <UModal v-model="showDeleteModal">
      <div class="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <UCard :ui="{ base: 'w-[400px]' }">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Confirm Delete</h3>
            <p class="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-4">
              <button 
                @click="showDeleteModal = false"
                class="px-4 py-2 rounded text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteFile"
                class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
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
          <div class="p-6 border-b border-slate-200">
            <h3 class="text-xl font-semibold text-slate-800">
              Transaction Details for: {{ selectedFileToView?.filename }}
            </h3>
          </div>
          
          <div class="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200 sticky top-0 bg-white">
                  <th class="text-left py-3 px-6 font-medium text-slate-600">Date</th>
                  <th class="text-left py-3 px-6 font-medium text-slate-600">Amount</th>
                  <th class="text-left py-3 px-6 font-medium text-slate-600">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in fileTransactions" :key="transaction.id" class="border-b border-slate-200">
                  <td class="py-3 px-6 text-slate-800">{{ new Date(transaction.date).toLocaleString() }}</td>
                  <td class="py-3 px-6 text-slate-800">{{ transaction.amount.toFixed(2) }}</td>
                  <td class="py-3 px-6 text-slate-800">{{ transaction.description }}</td>
                </tr>
                <tr v-if="fileTransactions.length === 0">
                  <td colspan="3" class="py-4 px-6 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-6 border-t border-slate-200 bg-white">
            <div class="flex justify-end">
              <button
                @click="showViewModal = false"
                class="px-4 py-2 rounded text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </UCard>
      </div>
    </UModal>
  </div>
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

function handleUpload() {
  // Create a hidden file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  
  // Handle file selection
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        // Here you would typically handle the file upload
        // For now, we'll just log it
        console.log('File selected:', file);
        // You can implement the actual file processing logic here
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };
  
  // Trigger the file input click
  input.click();
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
  background: #64748b;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style> 