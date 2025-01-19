<template>
  <div class="relative h-48 bg-gradient-to-r from-[#1B4D4B] to-[#2A6967] overflow-hidden">
    <div class="absolute inset-0 bg-black opacity-10"></div>
    <div class="relative z-10 p-8 h-full flex flex-col justify-end">
      <h2 class="text-4xl font-bold text-white mb-2">{{ title }}</h2>
      <p class="text-white/90">{{ subtitle }}</p>
    </div>
    <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Draft Section'
  },
  subtitle: {
    type: String,
    default: 'Start building your custom section'
  }
})
</script>