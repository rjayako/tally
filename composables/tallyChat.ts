import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { useContentSections } from '@/composables/useContentSections'
import { useChatInteractionStore } from '~/stores/chatInteraction'
import { useDexie, type ChatMessage } from '~/composables/useDexie'

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
  type: 'CREATE_SECTION' | 'SET_VISUALIZATION'
  payload: {
    id?: string
    title?: string
    type?: 'bar-graph' | 'pie-chart' | 'dynamic'
    sectionId?: string
    visualizationType?: 'bar-chart' | 'pie-chart'
  }
}

/**
 * Composable for handling AI chat functionality
 * Manages chat messages, section creation, and UI updates
 */
export function tallyChat() {
  // Initialize chat container ref for scrolling
  const chatContainer = ref<HTMLElement | null>(null)
  
  // Get Dexie functions
  const { getChatMessages, saveChatMessage } = useDexie()

  // Initialize local messages ref
  const localMessages = ref<Message[]>([])
  
  // Initialize chat with API endpoint
  const { messages: aiMessages, input, handleSubmit: originalHandleSubmit } = useChat({
    api: '/api/chat',
    maxSteps: 5
  })

  // Sync local messages with AI SDK messages
  watch(aiMessages, (newMessages) => {
    // Use a deep copy to avoid reactivity issues
    localMessages.value = JSON.parse(JSON.stringify(newMessages))
    // Save new messages to Dexie
    saveChatMessagesToDb(newMessages as unknown as Message[])
  }, { deep: true })

  // Function to save messages to Dexie
  const saveChatMessagesToDb = async (messagesToSave: Message[]) => {
    try {
      for (const message of messagesToSave) {
        // Check if message already exists in database by messageId
        await saveChatMessage({
          messageId: message.id,
          role: message.role,
          content: message.content,
          timestamp: new Date(),
          clientAction: message.__client_action ? JSON.stringify(message.__client_action) : undefined
        })
      }
    } catch (error) {
      console.error('Error saving chat messages to Dexie:', error)
    }
  }

  // Function to load messages from Dexie
  const loadChatMessagesFromDb = async () => {
    try {
      const storedMessages = await getChatMessages()
      if (storedMessages.length > 0) {
        // Convert Dexie messages to the format expected by the chat composable
        const formattedMessages = storedMessages.map(msg => ({
          id: msg.messageId,
          role: msg.role,
          content: msg.content,
          __client_action: msg.clientAction ? JSON.parse(msg.clientAction) : undefined
        }))
        
        // Update local messages
        localMessages.value = formattedMessages
        
        // Initialize AI SDK messages with stored messages (if empty)
        if (aiMessages.value.length === 0) {
          // We need to manually set each message to ensure proper reactivity
          formattedMessages.forEach(msg => {
            aiMessages.value.push(msg as any)
          })
        }
      }
    } catch (error) {
      console.error('Error loading chat messages from Dexie:', error)
    }
  }

  // Get section management functions
  const { addDynamicSection, showSection } = useContentSections()
  const chatInteractionStore = useChatInteractionStore()

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
      if (title) {
        const newSectionId = await addDynamicSection(title, undefined, type);
        
        // Show the new section
        await nextTick(() => {
          showSection(newSectionId);
        });
        
        // Notify navigation about the new section
        window.dispatchEvent(new CustomEvent('section-created', {
          detail: { sectionId: newSectionId }
        }));
        
        // Open chat for visualization selection
        chatInteractionStore.startVisualizationChat(newSectionId);
      }
    } else if (action.type === 'SET_VISUALIZATION') {
      const { sectionId, visualizationType } = action.payload;
      if (sectionId && visualizationType) {
        chatInteractionStore.setVisualization(sectionId, visualizationType);
      }
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
      // If in visualization selection mode, analyze intent first
      if (chatInteractionStore.isInteractionActive && chatInteractionStore.activeSectionId) {
        const sectionId = chatInteractionStore.activeSectionId;
        
        // Create user message
        const userMsg = {
          id: `user-${Date.now()}`,
          role: 'user' as const,
          content: userMessage
        };
        
        // Add user message to chat
        localMessages.value.push(userMsg);
        aiMessages.value.push(userMsg as any);
        
        // Save user message to Dexie
        await saveChatMessage({
          messageId: userMsg.id,
          role: userMsg.role,
          content: userMsg.content,
          timestamp: new Date()
        });
        
        // Create analyzing message
        const analyzingMsg = {
          id: `analyzing-${Date.now()}`,
          role: 'assistant' as const,
          content: 'Analyzing your preference...'
        };
        
        // Show "Analyzing your preference..." message
        localMessages.value.push(analyzingMsg);
        aiMessages.value.push(analyzingMsg as any);
        
        // Save analyzing message to Dexie
        await saveChatMessage({
          messageId: analyzingMsg.id,
          role: analyzingMsg.role,
          content: analyzingMsg.content,
          timestamp: new Date()
        });
        
        // Simulate a brief delay for analysis
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simple intent analysis - simplified for reliability
        const normalizedMessage = userMessage.toLowerCase();
        let visualizationType: 'bar-chart' | 'pie-chart' = 'bar-chart'; // Default
        
        if (normalizedMessage.includes('pie') || 
            normalizedMessage.includes('distribution') || 
            normalizedMessage.includes('percentage') || 
            normalizedMessage.includes('proportion')) {
          visualizationType = 'pie-chart';
        }
        
        // Set visualization type
        chatInteractionStore.setVisualization(sectionId, visualizationType);
        
        // Create response message
        const responseMsg = {
          id: `response-${Date.now()}`,
          role: 'assistant' as const,
          content: `Great! I'll use a ${visualizationType === 'bar-chart' ? 'bar chart' : 'pie chart'} to visualize the data in this section.`
        };
        
        // Add AI response confirming visualization choice
        localMessages.value.push(responseMsg);
        aiMessages.value.push(responseMsg as any);
        
        // Save response message to Dexie
        await saveChatMessage({
          messageId: responseMsg.id,
          role: responseMsg.role,
          content: responseMsg.content,
          timestamp: new Date()
        });
        
        scrollToBottom();
        
      } else {
        // Normal chat flow
        await originalHandleSubmit(e);
        
        // Get the last message and cast to Message to access __client_action
        const lastMessage = localMessages.value[localMessages.value.length - 1] as Message;
        if (lastMessage && lastMessage.__client_action) {
          await handleClientAction(lastMessage.__client_action);
        }
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }

    // Clear input
    input.value = '';
  }

  // Load messages from Dexie on mount
  onMounted(async () => {
    await loadChatMessagesFromDb()
    scrollToBottom()
  })

  // Watch for new messages and scroll to bottom
  watch(localMessages, () => {
    scrollToBottom()
  })

  return {
    messages: localMessages,
    input,
    handleSubmit,
    chatContainer,
    scrollToBottom
  }
}