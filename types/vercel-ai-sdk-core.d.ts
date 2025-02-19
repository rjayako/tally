declare module '@vercel/ai-sdk-core' {
  export interface GenerateTextOptions {
    prompt: string;
  }

  /**
   * Generates text from the provided prompt using Vercel AI services.
   * @param options - Options object containing the prompt string
   * @returns A Promise that resolves to the generated text as a string
   */
  export function generateText(options: GenerateTextOptions): Promise<string>;
} 