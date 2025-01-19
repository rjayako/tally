import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useChat } from '@ai-sdk/vue'

export function tallyChat() {
  const chatContainer = ref<HTMLElement | null>(null)
  const { messages, input, handleSubmit } = useChat({
    api: '/api/chat',
    maxSteps: 5
  })

  const scrollToBottom = () => {
    const container = chatContainer.value
    if (container) {
      nextTick(() => {
        container.scrollTop = container.scrollHeight
      })
    }
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