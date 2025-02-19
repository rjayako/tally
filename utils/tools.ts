import { tool } from 'ai';
import { z } from 'zod';
import { useSectionCreation } from '~/composables/useSectionCreation';

export const weatherTool = tool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const stockTool = tool({
  description: 'Get price for a stock',
  parameters: z.object({
    symbol: z.string().describe('The stock symbol to get the price for'),
  }),
  execute: async function ({ symbol }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});

export const createSectionTool = tool({
  description: 'Create a new section in the gallery navigation',
  parameters: z.object({
    title: z.string().describe('The title for the new section'),
  }),
  execute: async function ({ title }) {
    try {
      // Call the API directly instead of using the store
      const response = await $fetch('/api/sections', {
        method: 'POST',
        body: { title }
      });
      
      // Emit an event that the client can listen to through the chat response
      return { 
        success: true, 
        message: `Created new section: ${title}`, 
        sectionId: response.id,
        __client_action: {
          type: 'CREATE_SECTION',
          payload: {
            id: response.id,
            title: response.title
          }
        }
      };
    } catch (error) {
      console.error('Failed to create section:', error);
      return { success: false, message: 'Failed to create section' };
    }
  },
});

export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
  createSection: createSectionTool,
};
