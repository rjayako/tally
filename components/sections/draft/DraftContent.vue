<template>
  <div class="p-8">
    <div class="text-center">
      <p class="text-gray-600 text-lg">
        {{ message }}
      </p>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: 'This is your blank canvas. Use the chat to start creating your custom section.'
  }
})
</script>