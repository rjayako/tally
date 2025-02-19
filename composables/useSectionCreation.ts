import { useSectionsStore } from '~/stores/sections';

export const useSectionCreation = () => {
  const createSection = async (title: string) => {
    const sectionsStore = useSectionsStore();
    const section = await sectionsStore.createSection(title);
    return section;
  };

  return {
    createSection,
  };
};
