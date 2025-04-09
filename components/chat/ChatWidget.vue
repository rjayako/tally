<template>
  <div>
    <ChatButton @toggle="toggleChat" />
    <ChatBox
      :is-visible="isChatVisible"
      @close="closeChat"
    />
  </div>
</template>

<script setup>
import ChatButton from './ChatButton.vue'
import ChatBox from './ChatBox.vue'
import { useChatInteractionStore } from '~/stores/chatInteraction'

const isChatVisible = ref(false)
const chatInteractionStore = useChatInteractionStore()

// Watch for active interaction status and open chat when needed
watch(() => chatInteractionStore.isInteractionActive, (isActive) => {
  if (isActive) {
    console.log('Chat interaction active, opening chat window');
    isChatVisible.value = true
  }
})

const toggleChat = () => {
  isChatVisible.value = !isChatVisible.value
  
  // If closing chat during active interaction, cancel the interaction
  if (!isChatVisible.value && chatInteractionStore.isInteractionActive) {
    chatInteractionStore.cancelInteraction()
  }
}

const closeChat = () => {
  isChatVisible.value = false
  
  // Cancel any active interaction when chat is closed
  if (chatInteractionStore.isInteractionActive) {
    chatInteractionStore.cancelInteraction()
  }
}

// Function to be called externally to open chat
const openChatForSection = (sectionId) => {
  isChatVisible.value = true
  chatInteractionStore.startVisualizationChat(sectionId)
}

// Expose the method to the template
defineExpose({
  openChatForSection
})

// Listen for section creation events and visualization change requests
onMounted(() => {
  if (process.client) {
    window.addEventListener('section-created', (event) => {
      console.log('Section created event received', event.detail);
      isChatVisible.value = true
      
      // If we have a section ID, start visualization chat for it
      if (event.detail?.sectionId) {
        chatInteractionStore.startVisualizationChat(event.detail.sectionId)
      }
    })
    
    // Listen for requests to open chat for visualization changes
    window.addEventListener('open-chat-for-visualization', (event) => {
      console.log('Visualization change requested', event.detail);
      isChatVisible.value = true
      
      // The section will have already triggered startVisualizationChat
    })
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('section-created', () => {})
    window.removeEventListener('open-chat-for-visualization', () => {})
  }
})
</script>