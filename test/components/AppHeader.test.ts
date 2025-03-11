import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '~/components/AppHeader.vue'

// Mock the NuxtLink component
vi.mock('#app', () => ({
  useNuxtApp: vi.fn(),
  defineNuxtPlugin: vi.fn(),
  useRuntimeConfig: vi.fn(),
  navigateTo: vi.fn(),
}))

describe('AppHeader', () => {
  it('renders correctly', () => {
    const wrapper = mount(AppHeader)
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true)
    
    // Check if the logo is rendered
    expect(wrapper.find('img').exists()).toBe(true)
    
    // Check if the navigation links are rendered
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Import')
    expect(wrapper.text()).toContain('About')
  })

  it('highlights the active link', async () => {
    // Mock the useRoute composable to return a specific route
    vi.mock('#app', () => ({
      useNuxtApp: vi.fn(),
      defineNuxtPlugin: vi.fn(),
      useRuntimeConfig: vi.fn(),
      navigateTo: vi.fn(),
      useRoute: () => ({
        path: '/import',
      }),
    }), { virtual: true })
    
    const wrapper = mount(AppHeader)
    
    // Find all navigation links
    const links = wrapper.findAll('a')
    
    // Find the active link (Import)
    const activeLink = Array.from(links).find(link => link.text().includes('Import'))
    
    // Check if the active link has the active class
    expect(activeLink?.classes()).toContain('active')
    
    // Check if other links don't have the active class
    const homeLink = Array.from(links).find(link => link.text().includes('Home'))
    expect(homeLink?.classes()).not.toContain('active')
  })

  it('toggles mobile menu', async () => {
    const wrapper = mount(AppHeader)
    
    // Check if the mobile menu is initially hidden
    expect(wrapper.find('[data-test="mobile-menu"]').isVisible()).toBe(false)
    
    // Click the mobile menu button
    await wrapper.find('[data-test="mobile-menu-button"]').trigger('click')
    
    // Check if the mobile menu is now visible
    expect(wrapper.find('[data-test="mobile-menu"]').isVisible()).toBe(true)
    
    // Click the mobile menu button again
    await wrapper.find('[data-test="mobile-menu-button"]').trigger('click')
    
    // Check if the mobile menu is hidden again
    expect(wrapper.find('[data-test="mobile-menu"]').isVisible()).toBe(false)
  })
}) 