import { ref } from 'vue'

export function useFileValidation() {
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please upload a CSV or Excel file'
      }
    }

    return { isValid: true }
  }

  return {
    validateFile
  }
}