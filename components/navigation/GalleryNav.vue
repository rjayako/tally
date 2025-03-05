<template>
  <div class="w-full bg-white">
    <div class="container mx-auto px-4">
      <div class="overflow-x-auto flex items-center gap-10 scrollbar-hide">
        <button
          v-for="section in sectionsStore.sectionsWithIcons"
          :key="section.id"
          @click="handleSectionClick(section.id)"
          :class="[
            'relative py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center group',
            activeSectionId === section.id
              ? 'text-[#1B4D4B]'
              : 'text-[#666666] hover:text-[#1B4D4B]'
          ]"
        >
          <div class="flex items-center gap-2">
            <component :is="section.icon" class="w-4 h-4" />
            <span>{{ section.title }}</span>
          </div>
          <div
            :class="[
              'absolute bottom-0 -left-4 -right-4 h-0.5 transition-all duration-200',
              activeSectionId === section.id
                ? 'bg-[#1B4D4B]'
                : 'bg-transparent group-hover:bg-[#1B4D4B] opacity-0 group-hover:opacity-100'
            ]"
          />
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