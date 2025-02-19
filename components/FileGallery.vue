<template>
  <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <div v-for="file in filesList" :key="file.id" class="bg-white p-6 flex flex-col border-4 border-gray-100">
      <div class="mb-4">
        <span class="font-normal text-base text-black tracking-tight" :title="file.filename">
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
    <UCard :ui="{ base: 'w-[400px]' }">
      <div class="p-6">
        <h3 class="text-lg font-normal mb-2">Confirm Delete</h3>
        <p class="text-sm font-light text-gray-600 mb-6">
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
  </UModal>
</template>

<script setup lang="ts">
import { useDexie } from '~/composables/useDexie';
import type { File } from '~/composables/useDexie';

const { files } = useDexie();
const filesList = ref<File[]>([]);
const showDeleteModal = ref(false);
const selectedFile = ref<File | null>(null);

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

function viewFile(file: File) {
  // TODO: Implement file viewing functionality
  console.log('View file:', file);
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