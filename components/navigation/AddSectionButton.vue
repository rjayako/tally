<template>
  <button
    @click="$emit('click')"
    class="py-4 text-[#666666] hover:text-[#1B4D4B] transition-all duration-200"
    title="Add new section"
  >
    <div class="flex items-center gap-1">
      <span class="text-sm font-medium">Add</span>
      <Icon name="heroicons:plus" class="w-4 h-4" />
    </div>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void;
}>();
</script>