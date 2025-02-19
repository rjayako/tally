import { defineEventHandler } from 'h3';

/**
 * Request body interface for section creation
 */
interface CreateSectionRequest {
  title: string;
  type?: 'bar-graph' | 'pie-chart' | 'dynamic';
}

/**
 * Response interface for section creation
 */
interface CreateSectionResponse {
  id: string;
  title: string;
  type: string;
}

/**
 * POST /api/sections
 * Creates a new section with the specified title and type
 */
export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const { title, type = 'dynamic' } = await readBody<CreateSectionRequest>(event);
  
  if (!title) {
    throw createError({
      statusCode: 400,
      message: 'Title is required'
    });
  }
  
  // Generate a unique ID for the section
  const sectionId = `section-${Date.now()}`;
  
  // Create and return the response
  const response: CreateSectionResponse = {
    id: sectionId,
    title,
    type
  };
  
  return response;
});
