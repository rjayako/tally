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
const isChatVisible = ref(false)

const toggleChat = () => {
  isChatVisible.value = !isChatVisible.value
}

const closeChat = () => {
  isChatVisible.value = false
}
</script>