<template>
  <div class="hidden">
    <!-- This component is invisible and only handles the section creation logic -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSectionsStore } from '~/stores/sections';

const props = defineProps<{
  sectionData: {
    id: string;
    title: string;
  }
}>();

const sectionsStore = useSectionsStore();

onMounted(async () => {
  // Create the section using the store action
  await sectionsStore.createSection(props.sectionData.title, 'bar-graph');
  
  // Dispatch an event to notify GalleryNav
  window.dispatchEvent(new CustomEvent('section-created', { 
    detail: { sectionId: props.sectionData.id } 
  }));
});
</script>
