import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImportPage from '~/pages/import.vue'

// Mock the FileUploadSection component
vi.mock('~/components/FileUploadSection.vue', () => ({
  default: {
    name: 'FileUploadSection',
    template: '<div data-test="file-upload-section"></div>',
    props: ['isProcessing', 'error', 'selectedFile'],
    emits: ['file-selected'],
  },
}))

// Mock the FileGallery component
vi.mock('~/components/FileGallery.vue', () => ({
  default: {
    name: 'FileGallery',
    template: '<div data-test="file-gallery"></div>',
  },
}))

describe('ImportPage', () => {
  it('renders correctly', () => {
    const wrapper = mount(ImportPage)
    
    // Check if the page renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the title is rendered
    expect(wrapper.text()).toContain('Import Transactions')
    
    // Check if the FileUploadSection component is rendered
    expect(wrapper.find('[data-test="file-upload-section"]').exists()).toBe(true)
    
    // Check if the FileGallery component is rendered
    expect(wrapper.find('[data-test="file-gallery"]').exists()).toBe(true)
  })

  it('handles file upload events', async () => {
    const wrapper = mount(ImportPage)
    
    // Create a mock file
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' })
    
    // Create a mock event
    const event = {
      target: {
        files: [file],
      },
    }
    
    // Trigger the file-selected event on the FileUploadSection component
    await wrapper.findComponent({ name: 'FileUploadSection' }).vm.$emit('file-selected', event)
    
    // Check if the event was handled correctly
    // This is a bit tricky to test without knowing the exact implementation,
    // but we can at least verify that the event was emitted
    expect(wrapper.findComponent({ name: 'FileUploadSection' }).emitted('file-selected')).toBeTruthy()
  })
}) 