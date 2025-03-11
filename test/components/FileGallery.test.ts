import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FileGallery from '~/components/FileGallery.vue'

// Mock the composables
vi.mock('~/composables/useDexie', () => ({
  useDexie: () => ({
    files: {
      toArray: vi.fn().mockResolvedValue([
        {
          id: 1,
          filename: 'test1.csv',
          uploadDate: new Date('2023-01-01'),
          size: 1024,
          transactionCount: 10,
        },
        {
          id: 2,
          filename: 'test2.csv',
          uploadDate: new Date('2023-01-02'),
          size: 2048,
          transactionCount: 20,
        },
      ]),
    },
    getTransactions: vi.fn().mockResolvedValue([]),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock the formatDate and formatFileSize functions
vi.mock('~/utils/formatters', () => ({
  formatDate: (date: Date) => '01/01/2023',
  formatFileSize: (size: number) => '1 KB',
}), { virtual: true })

describe('FileGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the file list correctly', async () => {
    const wrapper = mount(FileGallery)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the title is rendered
    expect(wrapper.text()).toContain('Files Uploaded')
    
    // Check if the files are rendered
    expect(wrapper.text()).toContain('test1.csv')
    expect(wrapper.text()).toContain('test2.csv')
    
    // Check if the file details are rendered
    expect(wrapper.text()).toContain('Transactions')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('20')
  })

  it('shows the upload button', async () => {
    const wrapper = mount(FileGallery)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the upload card is rendered
    const uploadCard = wrapper.find('[data-test="upload-card"]')
    expect(uploadCard.exists()).toBe(true)
  })

  it('handles file deletion', async () => {
    const wrapper = mount(FileGallery)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Find and click the delete button for the first file
    const deleteButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Delete'))
    await deleteButtons[0].trigger('click')
    
    // Check if the confirmation dialog is shown
    expect(wrapper.find('[data-test="delete-confirmation"]').exists()).toBe(true)
    
    // Confirm deletion
    const confirmButton = wrapper.find('[data-test="confirm-delete"]')
    await confirmButton.trigger('click')
    
    // Verify that deleteFile was called with the correct file ID
    const { deleteFile } = await import('~/composables/useDexie')
    expect(deleteFile).toHaveBeenCalledWith(1)
  })

  it('handles file viewing', async () => {
    const wrapper = mount(FileGallery)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Find and click the view button for the first file
    const viewButtons = wrapper.findAll('button').filter(btn => btn.text().includes('View'))
    await viewButtons[0].trigger('click')
    
    // Check if the file details modal is shown
    expect(wrapper.find('[data-test="file-details-modal"]').exists()).toBe(true)
    
    // Check if the file details are displayed
    expect(wrapper.find('[data-test="file-details-modal"]').text()).toContain('test1.csv')
  })

  it('handles empty file list', async () => {
    // Override the mock to return an empty array
    vi.mock('~/composables/useDexie', () => ({
      useDexie: () => ({
        files: {
          toArray: vi.fn().mockResolvedValue([]),
        },
        getTransactions: vi.fn().mockResolvedValue([]),
      }),
    }), { virtual: true })
    
    const wrapper = mount(FileGallery)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the empty state message is displayed
    expect(wrapper.text()).toContain('No files uploaded yet')
  })
}) 