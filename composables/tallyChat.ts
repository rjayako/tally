import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
      const { title, type } = action.payload;
      // Create the section and get its id
      const newSectionId = await addDynamicSection(title, undefined, type);
      
      // Show the new section
      await nextTick(() => {
        showSection(newSectionId);
      });
      
      // Notify navigation about the new section
      window.dispatchEvent(new CustomEvent('section-created', {
        detail: { sectionId: newSectionId }
      }));
    }
  };

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
      
      // Get the last message and cast to Message to access __client_action
      const lastMessage = messages.value[messages.value.length - 1] as Message
      if (lastMessage && lastMessage.__client_action) {
        await handleClientAction(lastMessage.__client_action)
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