<template>
  <ClientOnly>
    <div v-if="isVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <DraftHeader :title="section?.title" />
        <DraftContent />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import DraftHeader from './draft/DraftHeader.vue'
import DraftContent from './draft/DraftContent.vue'
import { useContentSections } from '~/composables/useContentSections'

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  }
})

const { sections } = useContentSections()

const section = computed(() => 
  sections.value.find(s => s.id === props.sectionId)
)

const isVisible = computed(() => 
  section.value?.isVisible ?? false
)
</script>