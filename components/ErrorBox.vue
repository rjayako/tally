<template>
  <div v-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
    {{ error }}
  </div>
</template>

<script setup lang="ts">
// ErrorBox component displays error messages provided via a prop
const props = defineProps<{ error: string }>();
</script>

<style scoped>
/* Basic styling for error box */
</style> 