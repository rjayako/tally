<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-2">Current Weather for {{ location }}</h2>
    <p class="mb-1">Condition: {{ weather }}</p>
    <p>Temperature: {{ temperature }}°F</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  temperature: number;
  weather: string;
  location: string;
}

defineProps<Props>();
</script>
