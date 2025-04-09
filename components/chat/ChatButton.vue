<template>
  <button
    @click="$emit('toggle')"
    class="fixed bottom-6 right-12 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
    :class="{'bg-[#1B4D4B] hover:bg-[#2A6967]': !isVisualizationMode, 'bg-[#ff6b6b] hover:bg-[#ff8787]': isVisualizationMode}"
  >
    <svg
      v-if="!isVisualizationMode"
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    <svg 
      v-else
      xmlns="http://www.w3.org/2000/svg" 
      class="h-6 w-6 text-white" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
      />
    </svg>
  </button>
</template>

<script setup>
import { useChatInteractionStore } from '~/stores/chatInteraction'

const chatInteractionStore = useChatInteractionStore()

// Detect if in visualization mode
const isVisualizationMode = computed(() => chatInteractionStore.isInteractionActive)

defineEmits(['toggle'])
</script>