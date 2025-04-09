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

export const analyzeVisualizationIntentTool = tool({
  description: 'Analyze user message to determine their visualization preference (bar chart or pie chart)',
  parameters: z.object({
    userMessage: z.string().describe('The user message to analyze for visualization intent'),
    sectionId: z.string().describe('The section ID this visualization is for'),
  }),
  execute: async function ({ userMessage, sectionId }) {
    const normalizedMessage = userMessage.toLowerCase();
    
    // Simple intent analysis - could be replaced with more sophisticated NLP in production
    const barChartIndicators = ['bar', 'bar chart', 'bar graph', 'column', 'comparison', 'side by side'];
    const pieChartIndicators = ['pie', 'pie chart', 'distribution', 'ratio', 'proportion', 'percentage'];
    
    // Check if the message contains any indicators
    const containsBarIndicator = barChartIndicators.some(indicator => normalizedMessage.includes(indicator));
    const containsPieIndicator = pieChartIndicators.some(indicator => normalizedMessage.includes(indicator));
    
    let visualizationType = null;
    let confidence = 'low';
    
    // Determine the visualization type based on indicators
    if (containsBarIndicator && !containsPieIndicator) {
      visualizationType = 'bar-chart';
      confidence = 'high';
    } else if (containsPieIndicator && !containsBarIndicator) {
      visualizationType = 'pie-chart';
      confidence = 'high';
    } else if (containsBarIndicator && containsPieIndicator) {
      // If both indicators are present, choose the one that appears first or more frequently
      const barIndex = normalizedMessage.indexOf('bar');
      const pieIndex = normalizedMessage.indexOf('pie');
      
      visualizationType = (barIndex !== -1 && (pieIndex === -1 || barIndex < pieIndex)) 
        ? 'bar-chart' 
        : 'pie-chart';
      confidence = 'medium';
    }
    
    return { 
      visualizationType,
      confidence,
      sectionId,
      __client_action: visualizationType ? {
        type: 'SET_VISUALIZATION',
        payload: {
          sectionId,
          visualizationType
        }
      } : null
    };
  },
});

export const tools = {
  displayWeather: weatherTool,
  getStockPrice: stockTool,
  createSection: createSectionTool,
  analyzeVisualizationIntent: analyzeVisualizationIntentTool
};
