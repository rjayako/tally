<template>
  <div
    v-if="isVisible"
    ref="chatBox"
    class="fixed w-80 bg-white rounded-lg shadow-xl flex flex-col"
    :style="{
      top: `${position.y}px`,
      left: `${position.x}px`,
      height: `${height}px`,
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      transition: isDragging ? 'none' : 'transform 0.2s'
    }"
  >
    <!-- Header -->
    <div 
      class="p-4 border-b flex justify-between items-center cursor-move" 
      @mousedown="startDragging"
      @touchstart="startDragging"
    >
      <h3 class="font-semibold text-[#1B4D4B]">Chat</h3>
      <div class="flex items-center gap-2">
        <button @click="clearChatHistory" class="text-gray-500 hover:text-gray-700" title="Clear chat history">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Chat Area -->
    <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto" style="min-height: 200px;">
      <div v-for="message in messages" :key="message.id" class="mb-4">
        <div class="max-w-[80%] rounded-lg p-2"
          :class="[message.role === 'user' ? 'ml-auto bg-[#1B4D4B] text-white' : 'bg-gray-100 text-gray-800']"
        >
          <div class="whitespace-pre-wrap">
            <span class="font-medium">{{ message.role === 'user' ? 'User: ' : 'Tally AI: ' }}</span>
            <template v-if="message.content">{{ message.content }}</template>
            
            <div v-if="message.toolInvocations" v-for="(tool, index) in message.toolInvocations" :key="index" class="mt-2">
              <template v-if="tool.state === 'result'">
                <Weather v-if="tool.toolName === 'displayWeather'" v-bind="tool.result" />
                <Stock v-if="tool.toolName === 'getStockPrice'" v-bind="tool.result" />
                <div v-if="tool.toolName === 'createSection'" class="text-sm text-green-600">
                  {{ tool.result.message }}
                </div>
              </template>
              <template v-else>
                <div v-if="tool.toolName === 'displayWeather'" class="text-sm animate-pulse">
                  Loading weather information...
                </div>
                <div v-else-if="tool.toolName === 'getStockPrice'" class="text-sm animate-pulse">
                  Loading stock information...
                </div>
                <div v-else-if="tool.toolName === 'createSection'" class="text-sm animate-pulse">
                  Creating new section...
                </div>
                <div v-else class="text-sm animate-pulse">
                  Loading...
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t">
      <form @submit.prevent="handleSubmit" class="flex gap-2">
        <input
          v-model="input"
          type="text"
          :placeholder="inputPlaceholder"
          class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-[#1B4D4B] bg-white text-gray-800"
          :disabled="error != null"
        >
        <button
          type="submit"
          :disabled="error != null"
          class="px-4 py-2 bg-[#1B4D4B] text-white rounded-lg hover:bg-[#2A6967] transition-colors duration-200 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>

    <!-- Resize Handle -->
    <div
      class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
      @mousedown="startResizing"
      @touchstart="startResizing"
    >
      <svg
        viewBox="0 0 24 24"
        class="w-4 h-4 text-gray-400"
        fill="currentColor"
      >
        <path d="M22 22H20V20H22V22ZM22 18H18V20H22V18ZM18 22H16V24H18V22ZM14 22H12V24H14V22Z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import Weather from '../Weather.vue'
import Stock from '../Stock.vue'
import { tallyChat } from '~/composables/tallyChat'
import { useChatInteractionStore } from '~/stores/chatInteraction';
import { useSectionsStore } from '~/stores/sections';
import { inject } from 'vue';
import { useDexie } from '~/composables/useDexie';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const position = ref({ x: 0, y: 0 })
const height = ref(400) // Default height
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const chatBox = ref<HTMLElement | null>(null)
const chatContainer = ref<HTMLElement | null>(null)
const windowSize = ref({ width: 0, height: 0 })

const chatInteractionStore = useChatInteractionStore();
const { clearChatMessages } = useDexie();

const {
  messages,
  input,
  handleSubmit,
  chatContainer: chatContainerRef
} = tallyChat()

const inputPlaceholder = computed(() => {
  return chatInteractionStore.isInteractionActive
    ? "Bar chart or pie chart?"
    : "Say something...";
});

// Add this method to scroll to bottom when a new message is added
const addSystemMessage = (content: string) => {
  const message = {
    id: `system-${Date.now()}`,
    role: 'assistant', 
    content
  };
  messages.value.push(message as any);
  scrollToBottom();
};

// Watch for visualization interaction activation
watch(() => chatInteractionStore.isInteractionActive, (isActive, wasActive) => {
  if (isActive && !wasActive) {
    // Add a message to guide the user when entering visualization selection mode
    nextTick(() => {
      addSystemMessage('How would you like to visualize your data in this section? A bar chart or pie chart?');
    });
  }
});

// Also watch for visibility change to add the message if chat is opened after interaction started
watch(() => props.isVisible, (isVisible) => {
  if (isVisible && chatInteractionStore.isInteractionActive) {
    // Check if we don't already have the prompt message
    const hasPrompt = messages.value.some(msg => 
      msg.role === 'assistant' && 
      msg.content?.includes('visualize your data in this section')
    );
    
    if (!hasPrompt) {
      nextTick(() => {
        addSystemMessage('How would you like to visualize your data in this section? A bar chart or pie chart?');
      });
    }
  }
});

// Watch for visibility changes
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      scrollToBottom()
      updateWindowSize()
      // Set initial position when chat becomes visible
      if (position.value.x === 0 && position.value.y === 0) {
        position.value = {
          x: Math.max(10, windowSize.value.width - 350),
          y: Math.max(10, windowSize.value.height - height.value)
        }
      }
    })
  }
})

const updateWindowSize = () => {
  if (process.client) {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}

onMounted(() => {
  if (process.client) {
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updateWindowSize)
  }
})

const constrainPosition = (pos) => {
  if (!chatBox.value) return pos

  const box = chatBox.value.getBoundingClientRect()
  const maxX = windowSize.value.width - box.width
  const maxY = windowSize.value.height - height.value

  return {
    x: Math.min(Math.max(0, pos.x), maxX),
    y: Math.min(Math.max(0, pos.y), maxY)
  }
}

// Dragging functionality
const startDragging = (event) => {
  if (!process.client) return

  const e = event.type === 'touchstart' ? event.touches[0] : event
  isDragging.value = true
  const rect = chatBox.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  if (event.type === 'touchstart') {
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', stopDragging)
  } else {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDragging)
  }
}

const onDrag = (event) => {
  if (!isDragging.value) return

  const e = event.type === 'touchmove' ? event.touches[0] : event
  const newPosition = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }

  position.value = constrainPosition(newPosition)
}

const stopDragging = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDragging)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDragging)
}

// Resizing functionality
const startResizing = (event) => {
  if (!process.client) return
  event.stopPropagation()

  const e = event.type === 'touchstart' ? event.touches[0] : event
  isResizing.value = true

  if (event.type === 'touchstart') {
    document.addEventListener('touchmove', onResize)
    document.addEventListener('touchend', stopResizing)
  } else {
    document.addEventListener('mousemove', onResize)
    document.addEventListener('mouseup', stopResizing)
  }
}

const onResize = (event) => {
  if (!isResizing.value) return

  const e = event.type === 'touchmove' ? event.touches[0] : event
  const rect = chatBox.value.getBoundingClientRect()
  const newHeight = e.clientY - rect.top

  // Constrain height between minimum and maximum values
  height.value = Math.min(
    Math.max(300, newHeight), // Minimum height of 300px
    windowSize.value.height - position.value.y - 20 // Maximum height based on window
  )
}

const stopResizing = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResizing)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResizing)
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    nextTick(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    })
  }
}

// Watch for new messages and ensure scroll to bottom
watch(() => messages.value, () => {
  scrollToBottom()
}, { deep: true })

// Get the active section ID from the navigation component
const activeNavSectionId = inject('activeSectionId', ref('welcome'));

const triggerChangeVisualization = () => {
  // Get the active section from the sections store
  const sectionsStore = useSectionsStore();
  
  // Get the currently visible section
  const activeSection = sectionsStore.visibleSection;
  
  if (activeSection && activeSection.isDraft) {
    // Start visualization chat for the active section
    chatInteractionStore.startVisualizationChat(activeSection.id);
    
    // Add message to guide the user for changing visualization
    nextTick(() => {
      addSystemMessage(`How would you like to change the visualization for "${activeSection.title}"? Would you prefer a bar chart or pie chart?`);
    });
  } else {
    // No active section found or not a draft section
    addSystemMessage('No customizable visualization is currently active. Create a new section or select an existing dynamic section first.');
  }
}

// Function to clear chat history
const clearChatHistory = async () => {
  if (confirm('Are you sure you want to clear the chat history?')) {
    // Clear messages from Dexie
    await clearChatMessages();
    // Clear messages from local state
    messages.value = [];
    scrollToBottom();
  }
};
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>