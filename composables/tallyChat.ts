import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { useContentSections } from '@/composables/useContentSections'

/**
 * Interface for chat messages
 */
interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  __client_action?: ClientAction
}

/**
 * Interface for client-side actions triggered by AI responses
 */
interface ClientAction {
  type: 'CREATE_SECTION'
  payload: {
    id: string
    title: string
    type?: 'bar-graph' | 'pie-chart' | 'dynamic'
  }
}

/**
 * Composable for handling AI chat functionality
 * Manages chat messages, section creation, and UI updates
 */
export function tallyChat() {
  // Initialize chat container ref for scrolling
  const chatContainer = ref<HTMLElement | null>(null)
  
  // Initialize chat with API endpoint
  const { messages, input, handleSubmit: originalHandleSubmit } = useChat({
    api: '/api/chat',
    maxSteps: 5
  })

  // Get section management functions
  const { addDynamicSection, showSection } = useContentSections()

  /**
   * Scrolls the chat container to the bottom
   */
  const scrollToBottom = () => {
    const container = chatContainer.value
    if (container) {
      nextTick(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }

  /**
   * Handles client-side actions from AI responses
   */
  const handleClientAction = async (action: ClientAction) => {
    if (action.type === 'CREATE_SECTION') {
      const { id: sectionId, title, type } = action.payload
      
      // Create the section with specified type
      await addDynamicSection(title, undefined, type)
      
      // Show the new section
      await nextTick(() => {
        showSection(sectionId)
      })
      
      // Notify navigation about the new section
      window.dispatchEvent(new CustomEvent('section-created', { 
        detail: { sectionId } 
      }))
    }
  }

  /**
   * Enhanced submit handler for chat messages
   * Processes AI responses and handles section creation
   */
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    const userMessage = input.value.trim()
    if (!userMessage) return

    try {
      // Send message to AI and get response
      await originalHandleSubmit(e)
      
      // Get the last message which may contain a client action
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && '__client_action' in lastMessage) {
        await handleClientAction(lastMessage.__client_action as ClientAction)
      }
    } catch (error) {
      console.error('Error handling chat message:', error)
    }

    // Clear input and scroll to bottom
    input.value = ''
    scrollToBottom()
  }

  // Watch for new messages and scroll to bottom
  watch(messages, () => {
    scrollToBottom()
  })

  return {
    messages,
    input,
    handleSubmit,
    chatContainer,
    scrollToBottom
  }
}