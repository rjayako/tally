import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUploadSection from '~/components/FileUploadSection.vue'

// Mock the composables
vi.mock('~/composables/useDexie', () => ({
  useDexie: () => ({
    importTransactionCsv: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('~/composables/useCardConfigurations', () => ({
  useCardConfigurations: () => ({
    cardConfigurations: [
      { id: 'default', name: 'Default', description: 'Standard CSV format' },
      { id: 'amex', name: 'American Express', description: 'AMEX CSV format' },
    ],
  }),
}))

describe('FileUploadSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(FileUploadSection)
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the file input exists
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    
    // Check if the card configurations are rendered
    expect(wrapper.text()).toContain('Default')
    expect(wrapper.text()).toContain('American Express')
    
    // Check if the account type radio buttons are rendered
    expect(wrapper.find('input[value="credit"]').exists()).toBe(true)
    expect(wrapper.find('input[value="debit"]').exists()).toBe(true)
  })

  it('shows error message for non-CSV files', async () => {
    const wrapper = mount(FileUploadSection)
    
    // Create a mock file with incorrect extension
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    // Trigger file input change
    const input = wrapper.find('input[type="file"]')
    await input.setValue('')
    
    // Mock the files property which isn't properly handled by setValue
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: true,
    })
    
    // Trigger the change event
    await input.trigger('change')
    
    // Check if error message is displayed
    expect(wrapper.text()).toContain('Please upload a CSV file')
  })

  it('processes CSV file correctly', async () => {
    const wrapper = mount(FileUploadSection)
    
    // Create a mock CSV file
    const file = new File(['test,content'], 'test.csv', { type: 'text/csv' })
    
    // Select card type and account type
    await wrapper.find('input[value="amex"]').setValue(true)
    await wrapper.find('input[value="debit"]').setValue(true)
    
    // Trigger file input change
    const input = wrapper.find('input[type="file"]')
    await input.setValue('')
    
    // Mock the files property
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: true,
    })
    
    // Trigger the change event
    await input.trigger('change')
    
    // Check if the file name is displayed
    expect(wrapper.text()).toContain('File selected: test.csv')
    
    // Verify that importTransactionCsv was called with correct parameters
    const { importTransactionCsv } = await import('~/composables/useDexie')
    expect(importTransactionCsv).toHaveBeenCalledWith(
      'mock file content', // This comes from our mock File implementation
      'test.csv',
      'debit',
      'amex'
    )
  })

  it('handles file processing errors', async () => {
    // Override the mock to throw an error
    vi.mock('~/composables/useDexie', () => ({
      useDexie: () => ({
        importTransactionCsv: vi.fn().mockRejectedValue(new Error('Processing error')),
      }),
    }), { virtual: true })
    
    const wrapper = mount(FileUploadSection)
    
    // Create a mock CSV file
    const file = new File(['test,content'], 'test.csv', { type: 'text/csv' })
    
    // Trigger file input change
    const input = wrapper.find('input[type="file"]')
    await input.setValue('')
    
    // Mock the files property
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: true,
    })
    
    // Trigger the change event
    await input.trigger('change')
    
    // Check if error message is displayed
    expect(wrapper.text()).toContain('Processing error')
  })
}) 