<template>
  <div>
    <!-- ChatBox displays the error message -->
    <ErrorBox :error="chatError" />

    <!-- FileUploadSection emits 'chat-error' event when an error occurs -->
    <FileUploadSection @chat-error="onChatError" />
  </div>
</template>

<script setup lang="ts">
const chatError = ref('');

// Handles error from FileUploadSection and sets chatError which is passed to ChatBox
const onChatError = (message: string) => {
  chatError.value = message;
};
</script>

<style scoped>
/* Optional styling */
</style> 