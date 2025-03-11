import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeSection from '~/components/sections/WelcomeSection.vue'

// Mock the composables
vi.mock('~/composables/useDexie', () => ({
  useDexie: () => ({
    files: {
      toArray: vi.fn().mockResolvedValue([
        { id: 1, filename: 'test1.csv' },
        { id: 2, filename: 'test2.csv' },
      ]),
    },
    getTransactions: vi.fn().mockResolvedValue([
      { id: 1, categoryName: 'Food' },
      { id: 2, categoryName: 'Transport' },
      { id: 3, categoryName: 'Food' },
    ]),
  }),
}))

vi.mock('~/composables/useContentSections', () => ({
  useContentSections: () => ({
    sections: [
      { id: 'welcome', isVisible: true },
    ],
  }),
}))

vi.mock('~/stores/sections', () => ({
  useSectionsStore: () => ({
    sections: [
      { id: 'welcome', isVisible: true },
    ],
  }),
}))

// Mock the FileUploadSection and FileGallery components
vi.mock('~/components/FileUploadSection.vue', () => ({
  default: {
    name: 'FileUploadSection',
    template: '<div data-test="file-upload-section"></div>',
  },
}))

vi.mock('~/components/FileGallery.vue', () => ({
  default: {
    name: 'FileGallery',
    template: '<div data-test="file-gallery"></div>',
  },
}))

describe('WelcomeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when visible', async () => {
    const wrapper = mount(WelcomeSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the title is rendered
    expect(wrapper.text()).toContain('Quick Summary')
    
    // Check if the FileGallery component is rendered
    expect(wrapper.find('[data-test="file-gallery"]').exists()).toBe(true)
  })

  it('displays correct statistics', async () => {
    const wrapper = mount(WelcomeSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the statistics are rendered correctly
    expect(wrapper.text()).toContain('2') // File count
    expect(wrapper.text()).toContain('3') // Transaction count
    expect(wrapper.text()).toContain('2') // Unique categories count
  })

  it('does not render when not visible', async () => {
    // Override the mock to set isVisible to false
    vi.mock('~/stores/sections', () => ({
      useSectionsStore: () => ({
        sections: [
          { id: 'welcome', isVisible: false },
        ],
      }),
    }), { virtual: true })
    
    const wrapper = mount(WelcomeSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the component is not rendered
    expect(wrapper.html()).toBe('')
  })

  it('shows upload prompt when no files', async () => {
    // Override the mock to return an empty array
    vi.mock('~/composables/useDexie', () => ({
      useDexie: () => ({
        files: {
          toArray: vi.fn().mockResolvedValue([]),
        },
        getTransactions: vi.fn().mockResolvedValue([]),
      }),
    }), { virtual: true })
    
    const wrapper = mount(WelcomeSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the upload prompt is displayed
    expect(wrapper.text()).toContain('Upload transactions to get started')
    expect(wrapper.text()).toContain('Supported formats: CSV, Excel (.xlsx, .xls)')
  })
}) 