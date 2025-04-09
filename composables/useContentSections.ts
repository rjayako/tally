import { ref, computed } from 'vue'
import { HomeIcon, ChartIcon, InsightIcon, DraftIcon } from '~/components/icons'
import { useSectionsStore } from '~/stores/sections'
import type { Section } from '~/stores/sections'

export interface ContentSection {
  id: string
  title: string
  icon: any
  isVisible: boolean
  isDraft?: boolean
  content?: string
  type?: 'welcome' | 'trends' | 'insights' | 'dynamic'
}

/**
 * Composable for managing content sections
 * Provides utilities for section visibility and creation
 */
export function useContentSections() {
  const sectionsStore = useSectionsStore()

  /**
   * Hides a section by its ID
   */
  const hideSection = async (sectionId: string) => {
    await sectionsStore.hideSection(sectionId)
  }

  /**
   * Shows a section by its ID
   */
  const showSection = async (sectionId: string) => {
    await sectionsStore.showSection(sectionId)
  }

  /**
   * Creates a new dynamic section
   * @param title - The title of the section
   * @param content - Optional content for the section
   * @param type - The type of section (bar-graph, pie-chart, or dynamic)
   */
  const addDynamicSection = async (
    title: string, 
    content?: string, 
    type: Section['type'] = 'dynamic'
  ) => {
    try {
      const section = await sectionsStore.createSection(title, type)
      return section.id
    } catch (error) {
      console.error('Failed to create dynamic section:', error)
      throw error
    }
  }

  /**
   * Removes a section by its ID
   * @param sectionId - The ID of the section to remove
   */
  const removeSection = async (sectionId: string) => {
    await sectionsStore.removeSection(sectionId)
  }

  /**
   * Checks if a section is visible
   */
  const isSectionVisible = (sectionId: string): boolean => {
    const section = sectionsStore.sections.find(s => s.id === sectionId)
    return section?.isVisible ?? false
  }

  /**
   * Returns all dynamic (draft) sections
   */
  const getDynamicSections = computed(() => {
    return sectionsStore.sections.filter(s => s.isDraft)
  })

  return {
    sections: computed(() => sectionsStore.sections),
    hideSection,
    showSection,
    isSectionVisible,
    addDynamicSection,
    getDynamicSections,
    removeSection
  }
}