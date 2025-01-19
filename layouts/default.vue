<template>
  <div class="min-h-screen flex flex-col bg-[#e6e5e1]">
    <AppHeader />
    <GalleryNav />
    <main class="flex-grow container mx-auto p-4">
      <slot />
    </main>
    <AppFooter />
    <ChatWidget />
  </div>
</template>

<script setup>
import GalleryNav from '~/components/navigation/GalleryNav.vue'
</script>