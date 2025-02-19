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

const isChatVisible = ref(false)

const toggleChat = () => {
  isChatVisible.value = !isChatVisible.value
}

const closeChat = () => {
  isChatVisible.value = false
}
</script>