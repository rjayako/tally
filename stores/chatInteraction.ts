import { defineStore } from 'pinia';

interface SectionVisualizationState {
  [key: string]: 'bar-chart' | 'pie-chart' | null;
}

interface ChatInteractionState {
  isInteractionActive: boolean;
  activeSectionId: string | null;
  sectionVisualization: SectionVisualizationState;
  initialized: boolean;
}

export const useChatInteractionStore = defineStore('chatInteraction', {
  state: (): ChatInteractionState => ({
    isInteractionActive: false,
    activeSectionId: null,
    sectionVisualization: {},
    initialized: false
  }),
  actions: {
    async initialize() {
      if (this.initialized) return;
      
      try {
        const { getSections } = useDexie();
        const sections = await getSections();
        
        // Load visualization types from sections
        sections.forEach(section => {
          const visualizationType = section.type === 'bar-graph' ? 'bar-chart' :
                                   section.type === 'pie-chart' ? 'pie-chart' : null;
          this.sectionVisualization[section.sectionId] = visualizationType;
        });
        
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize visualization states from IndexedDB:', error);
      }
    },
    
    startVisualizationChat(sectionId: string) {
      // Ensure previous interactions are cleared
      if (this.activeSectionId && this.sectionVisualization[this.activeSectionId] === undefined) {
         this.sectionVisualization[this.activeSectionId] = null; // Mark previous as undecided if user didn't choose
      }
      this.isInteractionActive = true;
      this.activeSectionId = sectionId;
      // Initialize visualization state for the new section
      if (this.sectionVisualization[sectionId] === undefined) {
        this.sectionVisualization[sectionId] = null;
      }
    },
    
    async setVisualization(sectionId: string, type: 'bar-chart' | 'pie-chart' | null) {
      if (this.activeSectionId === sectionId && this.isInteractionActive) {
        this.sectionVisualization[sectionId] = type;
        if (type !== null) {
            this.isInteractionActive = false;
            this.activeSectionId = null;
            
            // Save visualization type to database
            await this.persistVisualizationType(sectionId, type);
        }
      } else {
        console.warn('Attempted to set visualization for inactive or incorrect section.');
        this.sectionVisualization[sectionId] = type;
        if (this.activeSectionId === sectionId && type === null) {
            this.isInteractionActive = false;
            this.activeSectionId = null;
        } else if (type !== null) {
            // Save visualization type to database even if not in active interaction
            await this.persistVisualizationType(sectionId, type);
        }
      }
    },
    
    async persistVisualizationType(sectionId: string, type: 'bar-chart' | 'pie-chart') {
      try {
        const { getSections } = useDexie();
        const sections = await getSections();
        const section = sections.find(s => s.sectionId === sectionId);
        
        if (section) {
          const { updateSectionType } = useDexie();
          // Convert visualization type to section type format
          const sectionType = type === 'bar-chart' ? 'bar-graph' : 'pie-chart';
          await updateSectionType(sectionId, sectionType);
        }
      } catch (error) {
        console.error(`Failed to persist visualization type for section ${sectionId}:`, error);
      }
    },
    
    cancelInteraction() {
      if (this.activeSectionId && this.sectionVisualization[this.activeSectionId] === undefined) {
         this.sectionVisualization[this.activeSectionId] = null; // Mark as undecided
      }
      this.isInteractionActive = false;
      this.activeSectionId = null;
    },
    
    // Optional: Action to clear visualization state if a section is deleted
    clearSectionVisualization(sectionId: string) {
        delete this.sectionVisualization[sectionId];
    }
  },
}); 