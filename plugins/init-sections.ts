import { useSectionsStore } from '~/stores/sections';
import { useChatInteractionStore } from '~/stores/chatInteraction';

/**
 * Plugin to initialize the sections and chat interaction stores when the app starts
 * This ensures data is loaded from IndexedDB before it's needed
 */
export default defineNuxtPlugin(async () => {
  const sectionsStore = useSectionsStore();
  const chatInteractionStore = useChatInteractionStore();
  
  // Initialize the sections store
  await sectionsStore.initialize();
  
  // Initialize the chat interaction store
  await chatInteractionStore.initialize();
  
  return {
    provide: {
      storesInitialized: true
    }
  };
}); 