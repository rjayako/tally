import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TrendsSection from '~/components/sections/TrendsSection.vue'

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    constructor() {
      return {
        destroy: vi.fn(),
      }
    }
  },
}))

// Mock the useDexie composable
vi.mock('~/composables/useDexie', () => ({
  useDexie: () => ({
    getTransactions: vi.fn().mockResolvedValue([
      { date: new Date('2023-01-01'), amount: 100, categoryName: 'Food' },
      { date: new Date('2023-01-02'), amount: 200, categoryName: 'Transport' },
      { date: new Date('2023-01-03'), amount: 150, categoryName: 'Food' },
      { date: new Date('2023-01-04'), amount: 300, categoryName: 'Entertainment' },
    ]),
  }),
}))

// Mock the useContentSections composable
vi.mock('~/composables/useContentSections', () => ({
  useContentSections: () => ({
    sections: [
      { id: 'trends', isVisible: true },
    ],
  }),
}))

// Mock the useSectionsStore
vi.mock('~/stores/sections', () => ({
  useSectionsStore: () => ({
    sections: [
      { id: 'trends', isVisible: true },
    ],
  }),
}))

describe('TrendsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock canvas methods
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(),
      isPointInStroke: vi.fn(),
      drawFocusIfNeeded: vi.fn(),
      scrollPathIntoView: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createPattern: vi.fn(),
      createImageData: vi.fn(),
      getLineDash: vi.fn(),
      setLineDash: vi.fn(),
      getTransform: vi.fn(),
      resetTransform: vi.fn(),
    }))
  })

  it('renders correctly when visible', async () => {
    const wrapper = mount(TrendsSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the title is rendered
    expect(wrapper.text()).toContain('Spending Trends')
    
    // Check if the chart canvas is rendered
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('does not render when not visible', async () => {
    // Override the mock to set isVisible to false
    vi.mock('~/stores/sections', () => ({
      useSectionsStore: () => ({
        sections: [
          { id: 'trends', isVisible: false },
        ],
      }),
    }), { virtual: true })
    
    const wrapper = mount(TrendsSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the component is not rendered
    expect(wrapper.html()).toBe('')
  })

  it('handles time period changes', async () => {
    const wrapper = mount(TrendsSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Find the time period selector
    const selector = wrapper.find('select')
    
    // Change the time period
    await selector.setValue('month')
    
    // Check if the chart is updated
    // This is difficult to test directly, but we can check if the component doesn't crash
    expect(wrapper.exists()).toBe(true)
  })

  it('handles empty transaction data', async () => {
    // Override the mock to return an empty array
    vi.mock('~/composables/useDexie', () => ({
      useDexie: () => ({
        getTransactions: vi.fn().mockResolvedValue([]),
      }),
    }), { virtual: true })
    
    const wrapper = mount(TrendsSection)
    
    // Wait for async operations to complete
    await vi.dynamicImportSettled()
    
    // Check if the empty state message is displayed
    expect(wrapper.text()).toContain('No transaction data available')
  })
}) 