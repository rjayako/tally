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
    ] as Section[],
    initialized: false
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
    },
    
    /**
     * Returns the currently visible section
     */
    visibleSection: (state) => {
      return state.sections.find(section => section.isVisible);
    },
    
    /**
     * Returns all visible sections
     */
    visibleSections: (state) => {
      return state.sections.filter(section => section.isVisible);
    }
  },

  actions: {
    /**
     * Initializes the store by loading sections from IndexedDB
     */
    async initialize() {
      if (this.initialized) return;
      
      try {
        const { loadSections } = useSectionStorage();
        const storedSections = await loadSections();
        
        if (storedSections.length > 0) {
          // Replace default sections with stored ones
          this.sections = storedSections;
        } else {
          // If no sections in IndexedDB, persist the default ones
          await this.persistAllSections();
        }
        
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize sections from IndexedDB:', error);
      }
    },
    
    /**
     * Persists all sections to IndexedDB
     */
    async persistAllSections() {
      const { persistSection } = useSectionStorage();
      
      try {
        const promises = this.sections.map(section => persistSection(section));
        await Promise.all(promises);
      } catch (error) {
        console.error('Failed to persist sections to IndexedDB:', error);
      }
    },
    
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
        
        // Add the new section
        this.sections.push(newSection);
        
        // Persist the new section to IndexedDB
        const { persistSection } = useSectionStorage();
        await persistSection(newSection);
        
        // Dispatch an event that the new section was created
        if (process.client) {
          window.dispatchEvent(new CustomEvent('section-created', {
            detail: { sectionId: newSection.id }
          }));
        }
        
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
    async hideSection(sectionId: string) {
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.isVisible = false;
        
        // Persist the visibility change to IndexedDB
        const { persistSectionVisibility } = useSectionStorage();
        await persistSectionVisibility(sectionId, false);
      }
    },
    
    /**
     * Shows a section by its ID and hides all others
     * @param sectionId - The ID of the section to show
     */
    async showSection(sectionId: string) {
      const { persistSectionVisibility } = useSectionStorage();
      const updatePromises: Promise<void>[] = [];
      
      // Hide all sections first
      this.sections.forEach(section => {
        const wasVisible = section.isVisible;
        section.isVisible = false;
        
        // Only persist changes for sections that were visible
        if (wasVisible) {
          updatePromises.push(persistSectionVisibility(section.id, false));
        }
      });
      
      // Show the requested section
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        section.isVisible = true;
        updatePromises.push(persistSectionVisibility(sectionId, true));
      }
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
    },
    
    /**
     * Removes a section by its ID
     * @param sectionId - The ID of the section to remove
     */
    async removeSection(sectionId: string) {
      const index = this.sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        this.sections.splice(index, 1);
        
        // Remove from IndexedDB
        const { removeSection } = useSectionStorage();
        await removeSection(sectionId);
      }
    }
  }
});
