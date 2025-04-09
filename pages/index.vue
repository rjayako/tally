<template>
  <div class="w-full overflow-x-hidden">
    <WelcomeSection />
    <TrendsSection />
    <InsightsSection />
    <DynamicSections />
  </div>
</template>

<script setup>
import WelcomeSection from '~/components/sections/WelcomeSection.vue'
import TrendsSection from '~/components/sections/TrendsSection.vue'
import InsightsSection from '~/components/sections/InsightsSection.vue'
import DynamicSections from '~/components/sections/DynamicSections.vue'
</script>