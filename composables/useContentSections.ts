import { ref } from 'vue'
import { HomeIcon, ChartIcon, InsightIcon, DraftIcon } from '~/components/icons'

export interface ContentSection {
  id: string
  title: string
  icon: any
  isVisible: boolean
  isDraft?: boolean
}

const sectionsState = ref<ContentSection[]>([
  { 
    id: 'welcome',
    title: 'Overview',
    icon: HomeIcon,
    isVisible: true 
  },
  { 
    id: 'trends',
    title: 'Trends',
    icon: ChartIcon,
    isVisible: false 
  },
  { 
    id: 'insights',
    title: 'Insights',
    icon: InsightIcon,
    isVisible: false 
  }
])

export function useContentSections() {
  const hideSection = (sectionId: string) => {
    const section = sectionsState.value.find(s => s.id === sectionId)
    if (section) {
      section.isVisible = false
    }
  }

  const showSection = (sectionId: string) => {
    const section = sectionsState.value.find(s => s.id === sectionId)
    if (section) {
      section.isVisible = true
    }
  }

  const addDraftSection = () => {
    const draftId = `draft-${Date.now()}`
    sectionsState.value.push({
      id: draftId,
      title: 'Draft Section',
      icon: DraftIcon,
      isVisible: false,
      isDraft: true
    })
    return draftId
  }

  const isSectionVisible = (sectionId: string): boolean => {
    const section = sectionsState.value.find(s => s.id === sectionId)
    return section?.isVisible ?? false
  }

  return {
    sections: sectionsState,
    hideSection,
    showSection,
    isSectionVisible,
    addDraftSection
  }
}