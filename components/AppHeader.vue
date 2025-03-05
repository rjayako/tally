<template>
  <header class="p-4">
    <nav class="container mx-auto flex justify-between items-center">
      <NuxtLink to="/" class="flex items-center">
        <div class="w-8 h-8 bg-[#1B4D4B] rounded flex items-center justify-center mr-2">
          <ChartIcon class="text-white" />
        </div>
        <span class="text-3xl font-bold text-[#1B4D4B]">WealthLens</span>
      </NuxtLink>
      
      <div class="flex items-center space-x-4">
        <NuxtLink to="/notifications" class="text-gray-700 hover:text-gray-900">
          Notifications
        </NuxtLink>
        <NuxtLink to="/profile" class="w-10 h-10 bg-[#1B4D4B] rounded-full flex items-center justify-center">
          <span class="text-white text-sm">P</span>
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ChartIcon } from './icons/index';

// Event handlers can be added as needed for the profile actions
</script>