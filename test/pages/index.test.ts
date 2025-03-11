import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from '~/pages/index.vue'

// Mock the section components
vi.mock('~/components/sections/WelcomeSection.vue', () => ({
  default: {
    name: 'WelcomeSection',
    template: '<div data-test="welcome-section"></div>',
  },
}))

vi.mock('~/components/sections/TrendsSection.vue', () => ({
  default: {
    name: 'TrendsSection',
    template: '<div data-test="trends-section"></div>',
  },
}))

vi.mock('~/components/sections/InsightsSection.vue', () => ({
  default: {
    name: 'InsightsSection',
    template: '<div data-test="insights-section"></div>',
  },
}))

vi.mock('~/components/sections/DynamicSections.vue', () => ({
  default: {
    name: 'DynamicSections',
    template: '<div data-test="dynamic-sections"></div>',
  },
}))

describe('IndexPage', () => {
  it('renders all sections correctly', () => {
    const wrapper = mount(IndexPage)
    
    // Check if all sections are rendered
    expect(wrapper.find('[data-test="welcome-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="trends-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="insights-section"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="dynamic-sections"]').exists()).toBe(true)
  })
}) 