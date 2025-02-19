<template>
  <ClientOnly>
    <div v-if="section.isVisible" class="max-w-6xl mx-auto mt-8">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="relative h-48 bg-gradient-to-r from-[#2A6967] to-[#1B4D4B] overflow-hidden">
          <div class="absolute inset-0 bg-black opacity-10"></div>
          <div class="relative z-10 p-8 h-full flex flex-col justify-end">
            <header>
              <div v-if="isEditing">
                <input v-model="titleInput" @keyup.enter="saveTitle" class="input-title-edit" />
                <button @click="saveTitle">Save</button>
                <button @click="cancelEdit">Cancel</button>
              </div>
              <div v-else>
                <h2 class="text-4xl font-bold text-white">
                  {{ section.title }}
                  <button @click="startEditing" class="ml-2 inline-flex items-center focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 3.487a2.993 2.993 0 014.242 4.243l-9.9 9.9a2.993 2.993 0 01-1.5.795l-4 1a1 1 0 01-1.214-1.214l1-4a2.993 2.993 0 01.795-1.5l9.9-9.9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6.5l4 4" />
                    </svg>
                  </button>
                </h2>
              </div>
            </header>
            <p class="text-white/90">Explore and visualize your data insights</p>
          </div>
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/2"></div>
        </div>
        
        <div class="p-8">
          <div v-if="!selectedChart" class="flex flex-col items-center justify-center space-y-6">
            <h3 class="text-xl font-semibold text-[#1B4D4B] w-full">Select a Chart Type</h3>
            <div class="flex flex-wrap gap-6 justify-center w-full">
              <button
                @click="selectChart('bar-graph')"
                class="flex flex-col items-center p-6 rounded-xl transition-all duration-200 hover:scale-105 bg-[#f8f8f8] hover:bg-[#E8EFEE] group w-48 min-h-[9rem]"
              >
                <div class="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#1B4D4B] text-white shadow-lg group-hover:shadow-xl transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 group-hover:scale-110 transition-transform">
                    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75c-1.036 0-1.875-.84-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75C3.84 21.75 3 20.91 3 19.875v-6.75z" />
                  </svg>
                </div>
                <span class="text-[#1B4D4B] font-medium group-hover:font-semibold text-sm">Bar Chart</span>
                <span class="text-xs text-gray-600">Compare values side by side</span>
              </button>

              <button
                @click="selectChart('pie-chart')"
                class="flex flex-col items-center p-6 rounded-xl transition-all duration-200 hover:scale-105 bg-[#f8f8f8] hover:bg-[#E8EFEE] group w-48 min-h-[9rem]"
              >
                <div class="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#1B4D4B] text-white shadow-lg group-hover:shadow-xl transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 group-hover:scale-110 transition-transform">
                    <path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-[#1B4D4B] font-medium group-hover:font-semibold text-sm">Pie Chart</span>
                <span class="text-xs text-gray-600">Show data distribution</span>
              </button>
            </div>
          </div>

          <template v-else>
            <div v-if="selectedChart === 'bar-graph'" class="min-h-[400px] h-full">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-[#1B4D4B]">{{ section.title }} Data</h3>
                <button
                  @click="selectedChart = null"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-[#1B4D4B] hover:bg-[#E8EFEE]"
                >
                  <Icon name="heroicons:arrow-path" class="w-5 h-5" />
                  <span>Change Chart</span>
                </button>
              </div>
              <BarGraph />
            </div>

            <div v-else-if="selectedChart === 'pie-chart'" class="min-h-[400px] h-full">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-[#1B4D4B]">{{ section.title }} Distribution</h3>
                <button
                  @click="selectedChart = null"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-[#1B4D4B] hover:bg-[#E8EFEE]"
                >
                  <Icon name="heroicons:arrow-path" class="w-5 h-5" />
                  <span>Change Chart</span>
                </button>
              </div>
              <PieChart />
            </div>
          </template>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * DynamicSection.vue
 * 
 * A dynamic section component that can display different types of content,
 * specifically focused on data visualization with charts.
 * 
 * Props:
 * - section: Section object containing the section's data and configuration
 */

import type { Section } from '~/stores/sections'
import { useSectionsStore } from '~/stores/sections'
import BarGraph from '~/components/sections/BarGraph.vue'
import PieChart from '~/components/sections/PieChart.vue'
import { useHead } from '#imports'

interface Props {
  section: Section
}

const props = defineProps<Props>()
const sectionsStore = useSectionsStore()

// State for selected chart type
const selectedChart = ref<'bar-graph' | 'pie-chart' | null>(null)

// State for editing title
const isEditing = ref(false)
const titleInput = ref(props.section.title)

// Compute the appropriate icon name based on section type
const getIconName = computed(() => {
  switch (props.section.iconName) {
    case 'ChartIcon':
      return 'i-heroicons-chart-bar'
    case 'PieChartIcon':
      return 'i-heroicons-chart-pie'
    case 'InsightIcon':
      return 'i-heroicons-light-bulb'
    case 'HomeIcon':
      return 'i-heroicons-home'
    default:
      return 'i-heroicons-document-text'
  }
})

// Handle section closure
const handleClose = () => {
  sectionsStore.hideSection(props.section.id)
}

// Handle chart selection
const selectChart = (type: 'bar-graph' | 'pie-chart') => {
  selectedChart.value = type
}

// Start editing
const startEditing = () => {
  isEditing.value = true
  titleInput.value = props.section.title
}

// Save title
const saveTitle = () => {
  // Update the section title and the document head
  // If section is mutable; if it's not, emit an event instead
  props.section.title = titleInput.value
  useHead({ title: titleInput.value })
  isEditing.value = false
}

// Cancel edit
const cancelEdit = () => {
  isEditing.value = false
  titleInput.value = props.section.title
}

// Optionally, watch the section title to update the head if it changes externally
watch(() => props.section.title, (newTitle: string) => {
  useHead({ title: newTitle });
})
</script> 
