import { ref } from 'vue'
import { useFileValidation } from './useFileValidation'
import { useContentSections } from './useContentSections'

export function useFileUpload() {
  const { validateFile } = useFileValidation()
  const { hideSection, showSection } = useContentSections()
  
  const selectedFile = ref<File | null>(null)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  const handleFileSelect = async (file: File) => {
    try {
      error.value = null
      isProcessing.value = true
      selectedFile.value = file

      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Process file (simulated for now)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Toggle sections
      hideSection('welcome')
      showSection('trends')

      return {
        success: true,
        fileName: file.name
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while processing the file'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isProcessing.value = false
    }
  }

  return {
    selectedFile,
    isProcessing,
    error,
    handleFileSelect
  }
}