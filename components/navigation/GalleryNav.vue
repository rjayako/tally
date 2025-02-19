<template>
  <div class="w-full bg-white shadow-sm">
    <div class="container mx-auto px-4">
      <div class="overflow-x-auto flex items-center space-x-4 py-4 scrollbar-hide">
        <button
          v-for="section in sectionsStore.sectionsWithIcons"
          :key="section.id"
          @click="handleSectionClick(section.id)"
          :class="[
            'px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap',
            activeSectionId === section.id
              ? 'bg-[#1B4D4B] text-white'
              : 'bg-gray-100 text-[#1B4D4B] hover:bg-gray-200'
          ]"
        >
          <div class="flex items-center space-x-2">
            <component :is="section.icon" class="w-5 h-5" />
            <span>{{ section.title }}</span>
          </div>
        </button>

        <AddSectionButton @click="handleAddSection" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AddSectionButton from './AddSectionButton.vue';
import { useSectionsStore } from '~/stores/sections';
import { useChatStore } from '~/stores/chat';

const sectionsStore = useSectionsStore();
const chatStore = useChatStore();
const activeSectionId = ref('welcome');

const handleSectionClick = (sectionId: string) => {
  sectionsStore.sections.forEach(section => {
    sectionsStore.hideSection(section.id);
  });
  
  sectionsStore.showSection(sectionId);
  activeSectionId.value = sectionId;

  const section = sectionsStore.sections.find(s => s.id === sectionId);
  if (section?.isDraft) {
    chatStore.openChat();
    chatStore.addMessage({
      text: "Welcome to your new section! What would you like to create here?",
      type: 'received'
    });
  }
};

const handleAddSection = () => {
  sectionsStore.createSection('New Section').then(section => {
    handleSectionClick(section.id);
  });
};

// Handle section creation from chat
const handleSectionCreated = (event: CustomEvent) => {
  const { sectionId } = event.detail;
  // Only handle navigation to the new section
  activeSectionId.value = sectionId;
};

onMounted(() => {
  window.addEventListener('section-created', handleSectionCreated as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('section-created', handleSectionCreated as EventListener);
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>