<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-2">Stock Information</h2>
    <p class="mb-1">Symbol: {{ symbol }}</p>
    <p>Price: ${{ price }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  price: number;
  symbol: string;
}

defineProps<Props>();
</script>
