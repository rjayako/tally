<template>
  <div class="space-y-6">
    <template v-for="section in dynamicSections" :key="section.id">
      <DynamicSection :section="section" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSectionsStore } from '~/stores/sections'
import type { Section } from '~/stores/sections'
import DynamicSection from './DynamicSection.vue'

const sectionsStore = useSectionsStore()

// Get all draft sections
const dynamicSections = computed<Section[]>(() => {
  const sections = sectionsStore.sections.filter(section => section.isDraft)
  console.log('Dynamic sections:', sections)
  return sections
})
</script> 
