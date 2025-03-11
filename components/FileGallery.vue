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
            <div class="flex justify-between">
              <span>Bank</span>
              <span>{{ getBankName(file.id) || 'Unknown Bank' }}</span>
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
        @click="showUploadModal = true"
        :class="[
          'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors',
          isUploading 
            ? 'border-emerald-300 text-emerald-500 cursor-default' 
            : 'border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 cursor-pointer'
        ]"
      >
        <template v-if="!isUploading">
          <Icon name="lucide:upload" class="w-6 h-6 mb-2" />
          <p>Upload New File</p>
        </template>
        <template v-else>
          <div class="w-full space-y-3">
            <div class="flex items-center justify-center">
              <Icon name="lucide:loader-2" class="w-6 h-6 mb-2 animate-spin" />
            </div>
            <p class="text-center">{{ uploadStatus }}</p>
            <div class="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" 
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
          </div>
        </template>
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
    
    <!-- File Upload Modal -->
    <UModal v-model="showUploadModal">
      <div class="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <UCard :ui="{ base: 'w-[500px] max-w-[95vw]' }">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-slate-800">Upload New File</h3>
              <button @click="showUploadModal = false" class="text-slate-400 hover:text-slate-600">
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="space-y-6">
              <!-- File Drop Zone -->
              <div 
                class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200"
                :class="[
                  selectedUploadFile 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                ]"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <input 
                  ref="fileInputRef"
                  type="file" 
                  accept=".csv" 
                  class="hidden" 
                  @change="handleFileSelected"
                />
                
                <div v-if="!selectedUploadFile" class="py-4">
                  <div class="mb-4">
                    <Icon name="lucide:upload-cloud" class="w-12 h-12 mx-auto text-slate-400" />
                  </div>
                  <h4 class="font-medium text-slate-700 mb-2">Drag and drop your file here</h4>
                  <p class="text-sm text-slate-500 mb-4">or</p>
                  <button 
                    @click="browseFiles"
                    class="px-5 py-2.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors inline-flex items-center"
                  >
                    <Icon name="lucide:folder-open" class="w-4 h-4 mr-2" />
                    Browse Files
                  </button>
                  <p class="text-xs text-slate-500 mt-4">
                    Supported format: CSV
                  </p>
                </div>
                
                <div v-else class="py-4">
                  <div class="flex items-center justify-center mb-3">
                    <div class="bg-emerald-100 text-emerald-700 p-3 rounded-full">
                      <Icon name="lucide:file-text" class="w-8 h-8" />
                    </div>
                  </div>
                  <h4 class="font-medium text-emerald-700 mb-1 text-lg">{{ selectedUploadFile.name }}</h4>
                  <p class="text-sm text-slate-500 mb-3">{{ formatFileSize(selectedUploadFile.size) }}</p>
                  <button 
                    @click="resetFileInput"
                    class="text-sm text-slate-600 hover:text-red-600 transition-colors inline-flex items-center"
                  >
                    <Icon name="lucide:x" class="w-3.5 h-3.5 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
              
              <!-- Card Type Selection -->
              <div class="border border-slate-200 rounded-xl p-5 bg-slate-50">
                <h4 class="font-medium text-slate-800 mb-4">Card Type <span class="text-red-500">*</span></h4>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon name="lucide:building-bank" class="w-5 h-5 text-slate-400" />
                  </div>
                  <select
                    v-model="selectedCardConfigId"
                    class="block w-full pl-10 px-4 py-3 pr-10 text-base border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-700 font-medium transition-colors duration-200 hover:border-emerald-300"
                    :class="{ 'text-emerald-600': selectedCardConfigId }"
                  >
                    <option value="" disabled>Select your bank or card type</option>
                    <optgroup label="Credit Cards">
                      <option 
                        v-for="config in creditCardConfigs" 
                        :key="config.id" 
                        :value="config.id"
                      >
                        {{ config.name }}
                      </option>
                    </optgroup>
                    <optgroup label="Debit Cards">
                      <option 
                        v-for="config in debitCardConfigs" 
                        :key="config.id" 
                        :value="config.id"
                      >
                        {{ config.name }}
                      </option>
                    </optgroup>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <Icon name="lucide:chevron-down" class="w-5 h-5 text-slate-500" />
                  </div>
                </div>
                <p class="text-xs text-slate-500 mt-2" v-if="selectedCardDescription">
                  <span class="flex items-start">
                    <Icon name="lucide:info" class="w-3.5 h-3.5 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{{ selectedCardDescription }}</span>
                  </span>
                </p>
                <p v-if="cardConfigError" class="text-red-500 text-xs mt-3 flex items-center">
                  <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 mr-1" />
                  Please select a card type
                </p>
              </div>
              
              <!-- Transaction Type Selection -->
              <div class="border border-slate-200 rounded-xl p-5 bg-slate-50">
                <h4 class="font-medium text-slate-800 mb-4">Transaction Type <span class="text-red-500">*</span></h4>
                <div class="grid grid-cols-2 gap-4">
                  <label 
                    class="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                    :class="[
                      accountType === 'credit' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                    ]"
                  >
                    <input 
                      type="radio" 
                      v-model="accountType" 
                      value="credit" 
                      class="sr-only"
                    />
                    <div class="mb-2 text-center">
                      <div 
                        class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                        :class="[
                          accountType === 'credit' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500'
                        ]"
                      >
                        <Icon name="lucide:credit-card" class="w-6 h-6" />
                      </div>
                      <span 
                        class="font-medium"
                        :class="[
                          accountType === 'credit' 
                            ? 'text-emerald-700' 
                            : 'text-slate-700'
                        ]"
                      >
                        Credit Card
                      </span>
                    </div>
                  </label>
                  
                  <label 
                    class="flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                    :class="[
                      accountType === 'debit' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                    ]"
                  >
                    <input 
                      type="radio" 
                      v-model="accountType" 
                      value="debit" 
                      class="sr-only"
                    />
                    <div class="mb-2 text-center">
                      <div 
                        class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                        :class="[
                          accountType === 'debit' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500'
                        ]"
                      >
                        <Icon name="lucide:landmark" class="w-6 h-6" />
                      </div>
                      <span 
                        class="font-medium"
                        :class="[
                          accountType === 'debit' 
                            ? 'text-emerald-700' 
                            : 'text-slate-700'
                        ]"
                      >
                        Debit Card
                      </span>
                    </div>
                  </label>
                </div>
                <p v-if="accountTypeError" class="text-red-500 text-xs mt-3 flex items-center">
                  <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 mr-1" />
                  Please select a transaction type
                </p>
              </div>
              
              <div v-if="uploadError" class="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm flex items-start">
                <Icon name="lucide:alert-triangle" class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{{ uploadError }}</span>
              </div>
              
              <div class="flex justify-end gap-4 pt-2">
                <button 
                  @click="showUploadModal = false"
                  class="px-5 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  @click="beginUpload"
                  :disabled="!selectedUploadFile || isUploading"
                  :class="[
                    'px-5 py-2.5 rounded-lg text-white transition-colors flex items-center',
                    selectedUploadFile && !isUploading 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-emerald-400 cursor-not-allowed'
                  ]"
                >
                  <span v-if="!isUploading">
                    <Icon name="lucide:upload" class="w-4 h-4 mr-2 inline-block" />
                    Begin Upload
                  </span>
                  <span v-else class="flex items-center">
                    <Icon name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </span>
                </button>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';
import { useCardConfigurations } from '~/composables/useCardConfigurations';
import type { File } from '~/composables/useDexie';
import type { CardConfiguration } from '~/composables/useCardConfigurations';

const { files, getTransactions, importTransactionCsv } = useDexie();
const { cardConfigurations } = useCardConfigurations();

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

// Upload progress tracking
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const showUploadModal = ref(false);
const uploadError = ref('');
const accountTypeError = ref(false);
const cardConfigError = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedUploadFile = ref<globalThis.File | null>(null);
const accountType = ref<string | null>(null);
const selectedCardConfigId = ref<string>('');

// Computed properties for card configurations
const creditCardConfigs = computed(() => {
  return cardConfigurations.value.filter((config: CardConfiguration) => 
    ['default', 'amex', 'chase', 'discover'].includes(config.id)
  );
});

const debitCardConfigs = computed(() => {
  return cardConfigurations.value.filter((config: CardConfiguration) => 
    ['rbc', 'td', 'scotiabank', 'bmo', 'cibc', 'tangerine'].includes(config.id)
  );
});

const selectedCardDescription = computed(() => {
  const selectedConfig = cardConfigurations.value.find((config: CardConfiguration) => config.id === selectedCardConfigId.value);
  return selectedConfig ? selectedConfig.description : '';
});

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

function browseFiles() {
  fileInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  
  const file = input.files[0];
  
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    uploadError.value = 'Please upload a CSV file';
    return;
  }
  
  selectedUploadFile.value = file;
  uploadError.value = '';
}

function handleFileDrop(event: DragEvent) {
  if (!event.dataTransfer?.files.length) return;
  
  const file = event.dataTransfer.files[0];
  
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    uploadError.value = 'Please upload a CSV file';
    return;
  }
  
  selectedUploadFile.value = file;
  uploadError.value = '';
}

async function beginUpload() {
  if (!selectedUploadFile.value || isUploading.value) return;
  
  // Reset error flags
  accountTypeError.value = false;
  cardConfigError.value = false;
  
  // Validate account type is selected
  if (!accountType.value) {
    accountTypeError.value = true;
    return;
  }
  
  // Validate card type is selected
  if (!selectedCardConfigId.value) {
    cardConfigError.value = true;
    return;
  }
  
  try {
    // Start upload process
    isUploading.value = true;
    uploadProgress.value = 10;
    uploadStatus.value = 'Reading file...';
    
    // Close the modal to show progress in the card
    showUploadModal.value = false;
    
    // Read file content
    const content = await selectedUploadFile.value.text();
    uploadProgress.value = 30;
    uploadStatus.value = 'Parsing CSV data...';
    
    // Simulate processing steps with progress updates
    await new Promise(resolve => setTimeout(resolve, 500));
    uploadProgress.value = 50;
    uploadStatus.value = 'Processing transactions...';
    
    // Import the CSV data using the useDexie composable with the selected card configuration
    await importTransactionCsv(
      content, 
      selectedUploadFile.value.name, 
      accountType.value, 
      selectedCardConfigId.value
    );
    
    uploadProgress.value = 80;
    uploadStatus.value = 'Categorizing transactions...';
    
    // Simulate final processing
    await new Promise(resolve => setTimeout(resolve, 500));
    uploadProgress.value = 100;
    uploadStatus.value = 'Complete!';
    
    // Refresh the file list
    await loadFiles();
    
    // Reset upload state after a short delay to show completion
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
      uploadStatus.value = '';
      selectedUploadFile.value = null;
      selectedCardConfigId.value = '';
      accountType.value = null;
      
      // Reset file input
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }, 1000);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    uploadStatus.value = `Error: ${error.message || 'Error uploading file'}`;
    
    // Reset upload state after error display
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
      uploadStatus.value = '';
    }, 3000);
  }
}

function resetFileInput() {
  selectedUploadFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function getBankName(fileId: number | undefined) {
  if (!fileId) return null;
  
  // Find the file in our list
  const file = filesList.value.find((f: File) => f.id === fileId);
  if (!file) return null;
  
  // If the file has a cardConfigId, use it to get the bank name
  if (file.cardConfigId) {
    const config = cardConfigurations.value.find((config: CardConfiguration) => config.id === file.cardConfigId);
    if (config) return config.name;
  }
  
  // Fallback: Find a matching card configuration based on the bank name pattern in the file name
  const fileName = file.filename.toLowerCase();
  
  for (const config of cardConfigurations.value) {
    // Check if the file name contains the bank name (case insensitive)
    if (fileName.includes(config.id.toLowerCase()) || 
        fileName.includes(config.name.toLowerCase())) {
      return config.name;
    }
  }
  
  // If no match found, return a default value
  return 'Unknown Bank';
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