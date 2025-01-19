import { ref } from 'vue'

export interface DraftSectionState {
  isEditing: boolean
  content: string
}

export function useDraftSection(sectionId: string) {
  const state = ref<DraftSectionState>({
    isEditing: false,
    content: ''
  })

  const startEditing = () => {
    state.value.isEditing = true
  }

  const stopEditing = () => {
    state.value.isEditing = false
  }

  const updateContent = (newContent: string) => {
    state.value.content = newContent
  }

  return {
    state,
    startEditing,
    stopEditing,
    updateContent
  }
}