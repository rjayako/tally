import { defineStore } from 'pinia'

interface ChatMessage {
  text: string
  type: 'sent' | 'received'
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    isVisible: false,
    messages: [] as ChatMessage[]
  }),

  actions: {
    openChat() {
      this.isVisible = true
    },

    closeChat() {
      this.isVisible = false
    },

    addMessage(message: ChatMessage) {
      this.messages.push(message)
    }
  }
})