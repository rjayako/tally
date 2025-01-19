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
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Chat Area -->
    <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto" style="min-height: 200px;">
      <div v-for="message in messages" :key="message.id" class="mb-4">
        <div class="max-w-[80%] rounded-lg p-2"
          :class="[message.role === 'user' ? 'ml-auto bg-[#1B4D4B] text-white' : 'bg-gray-100']"
        >
          <div class="whitespace-pre-wrap">
            <span class="font-medium">{{ message.role === 'user' ? 'User: ' : 'Tally AI: ' }}</span>
            <template v-if="message.content">{{ message.content }}</template>
            
            <div v-if="message.toolInvocations" v-for="(tool, index) in message.toolInvocations" :key="index" class="mt-2">
              <template v-if="tool.state === 'result'">
                <Weather v-if="tool.toolName === 'displayWeather'" v-bind="tool.result" />
                <Stock v-if="tool.toolName === 'getStockPrice'" v-bind="tool.result" />
              </template>
              <template v-else>
                <div v-if="tool.toolName === 'displayWeather'" class="text-sm animate-pulse">
                  Loading weather information...
                </div>
                <div v-else-if="tool.toolName === 'getStockPrice'" class="text-sm animate-pulse">
                  Loading stock information...
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
          placeholder="Say something..."
          class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-[#1B4D4B]"
        >
        <button
          type="submit"
          class="px-4 py-2 bg-[#1B4D4B] text-white rounded-lg hover:bg-[#2A6967] transition-colors duration-200"
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
import { useChat } from '@ai-sdk/vue'
import Weather from '../Weather.vue'
import Stock from '../Stock.vue'

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

const {
  messages,
  input,
  handleSubmit
} = useChat({
  api: '/api/chat',
  maxSteps: 5
})

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
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>