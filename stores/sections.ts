import { defineStore } from 'pinia';
import { HomeIcon, ChartIcon, InsightIcon, DraftIcon } from '~/components/icons';

/**
 * Section interface representing a content section in the application
 */
export interface Section {
  id: string;
  title: string;
  iconName: string;
  isVisible: boolean;
  isDraft?: boolean;
  type?: 'bar-graph' | 'pie-chart' | 'dynamic'; // Restrict type to valid values
}

/**
 * API response interface for section creation
 */
interface CreateSectionResponse {
  id: string;
  title: string;
  type?: string;
}

/**
 * Maps icon names to their component implementations
 */
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'HomeIcon':
      return HomeIcon;
    case 'ChartIcon':
      return ChartIcon;
    case 'InsightIcon':
      return InsightIcon;
    case 'DraftIcon':
      return DraftIcon;
    default:
      return DraftIcon;
  }
};

/**
 * Store for managing sections in the application
 * Handles section creation, visibility, and state management
 */
export const useSectionsStore = defineStore('sections', {
  state: () => ({
    sections: [
      { 
        id: 'welcome',
        title: 'Overview',
        iconName: 'HomeIcon',
        isVisible: true,
        type: 'dynamic'
      },
      { 
        id: 'trends',
        title: 'Trends',
        iconName: 'ChartIcon',
        isVisible: false,
        type: 'bar-graph'
      },
      { 
        id: 'insights',
        title: 'Insights',
        iconName: 'InsightIcon',
        isVisible: false,
        type: 'dynamic'
      }
    ] as Section[]
  }),
  
  getters: {
    /**
     * Returns sections with their icon components
     */
    sectionsWithIcons: (state) => {
      return state.sections.map(section => ({
        ...section,
        icon: getIconComponent(section.iconName)
      }));
    }
  },

  actions: {
    /**
     * Creates a new section with the specified title and type
     * @param title - The title of the section
     * @param type - The type of section (bar-graph, pie-chart, or dynamic)
     */
    async createSection(title: string, type: Section['type'] = 'dynamic') {
      try {
        console.log('Creating section:', { title, type });
        
        // Create section via API
        const response = await $fetch<CreateSectionResponse>('/api/sections', {
          method: 'POST',
          body: { title, type }
        });
        
        // Create new section object
        const newSection: Section = {
          id: response.id,
          title: response.title,
          iconName: 'DraftIcon',
          isVisible: true,
          isDraft: true,
          type: type
        };
        
        // Hide all existing sections
        this.sections.forEach(section => {
          section.isVisible = false;
        });
        
        // Add and return the new section
        this.sections.push(newSection);
        return newSection;
      } catch (error) {
        console.error('Failed to create section:', error);
        throw error;
      }
    },
    
    /**
     * Hides a section by its ID
     * @param sectionId - The ID of the section to hide
     */
    hideSection(sectionId: string) {
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.isVisible = false;
      }
    },
    
    /**
     * Shows a section by its ID and hides all others
     * @param sectionId - The ID of the section to show
     */
    showSection(sectionId: string) {
      // Hide all sections first
      this.sections.forEach(section => {
        section.isVisible = false;
      });
      
      // Show the requested section
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.isVisible = true;
      }
    }
  }
});
