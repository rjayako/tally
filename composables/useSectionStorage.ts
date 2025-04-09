import { useDexie, type Section as DexieSection } from './useDexie';
import type { Section } from '~/stores/sections';

/**
 * Composable for persisting sections to IndexedDB using Dexie
 */
export function useSectionStorage() {
  const { saveSection, getSections, updateSectionVisibility, deleteSection } = useDexie();

  /**
   * Converts a Pinia Section to a Dexie Section format
   */
  const toDexieSection = (section: Section): Omit<DexieSection, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      sectionId: section.id,
      title: section.title,
      iconName: section.iconName,
      isVisible: section.isVisible,
      isDraft: section.isDraft ?? false,
      type: section.type ?? 'dynamic'
    };
  };

  /**
   * Converts a Dexie Section to a Pinia Section format
   */
  const toPiniaSection = (section: DexieSection): Section => {
    return {
      id: section.sectionId,
      title: section.title,
      iconName: section.iconName,
      isVisible: section.isVisible,
      isDraft: section.isDraft,
      type: section.type as Section['type']
    };
  };

  /**
   * Persists a section to IndexedDB
   * @param section - The section to persist
   */
  const persistSection = async (section: Section): Promise<void> => {
    await saveSection(toDexieSection(section));
  };

  /**
   * Loads all sections from IndexedDB
   * @returns An array of sections in Pinia format
   */
  const loadSections = async (): Promise<Section[]> => {
    const dexieSections = await getSections();
    return dexieSections.map(toPiniaSection);
  };

  /**
   * Updates the visibility of a section in IndexedDB
   * @param sectionId - The ID of the section
   * @param isVisible - Whether the section should be visible
   */
  const persistSectionVisibility = async (sectionId: string, isVisible: boolean): Promise<void> => {
    await updateSectionVisibility(sectionId, isVisible);
  };

  /**
   * Removes a section from IndexedDB
   * @param sectionId - The ID of the section to remove
   * @returns True if the section was removed, false otherwise
   */
  const removeSection = async (sectionId: string): Promise<boolean> => {
    return await deleteSection(sectionId);
  };

  return {
    persistSection,
    loadSections,
    persistSectionVisibility,
    removeSection
  };
} 