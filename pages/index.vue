<template>
  <div>
    <WelcomeSection />
    <TrendsSection />
    <InsightsSection />
    <DraftSection 
      v-for="section in draftSections" 
      :key="section.id"
      :section-id="section.id"
    />
  </div>
</template>

<script setup>
import WelcomeSection from '~/components/sections/WelcomeSection.vue'
import TrendsSection from '~/components/sections/TrendsSection.vue'
import InsightsSection from '~/components/sections/InsightsSection.vue'
import DraftSection from '~/components/sections/DraftSection.vue'
import { useContentSections } from '~/composables/useContentSections'

const { sections } = useContentSections()
const draftSections = computed(() => 
  sections.value.filter(section => section.isDraft)
)
</script>