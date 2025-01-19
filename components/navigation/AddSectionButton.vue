<template>
  <button
    @click="$emit('click')"
    class="w-12 h-12 rounded-full transition-all duration-200 bg-[#E8EFEE] hover:bg-[#D1E0DF] flex items-center justify-center"
    title="Add new section"
  >
    <PlusIcon class="w-6 h-6 text-[#1B4D4B]" />
  </button>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline';

defineEmits<{
  (e: 'click'): void;
}>();
</script>