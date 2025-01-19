<template>
  <header class="p-4">
    <nav class="container mx-auto flex justify-between items-center">
      <NuxtLink to="/" class="text-3xl font-bold text-[#1B4D4B]">WealthLens</NuxtLink>
      <ProfileDropdown @action="handleProfileAction" />
    </nav>
  </header>
</template>

<script setup lang="ts">
import ProfileDropdown from './header/ProfileDropdown.vue';

const handleProfileAction = (action: string) => {
  switch (action) {
    case 'upload':
      // Handle upload
      console.log('Handle upload');
      break;
    case 'settings':
      // Handle settings
      console.log('Handle settings');
      break;
    case 'logout':
      // Handle logout
      console.log('Handle logout');
      break;
  }
};
</script>