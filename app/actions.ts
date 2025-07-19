"use server";

import path from 'path';
import { promises as fs } from 'fs';
import { z } from 'zod';
import { mistral, createMistral } from '@ai-sdk/mistral';
import { generateObject } from 'ai';

export async function readSystemPrompt(url: string) {
  'use server';
  const filePath = path.join(process.cwd(), 'data', url);
  console.log('Reading system prompt from:', filePath);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (err) {
    console.error('Error reading system prompt:', err);
    throw err;
  }
}

export const generateQuery = async (input: string) => {
    'use server';

    const data = await readSystemPrompt('system-prompt.txt');

    const mistralClient = createMistral({
        apiKey: process.env.MISTRAL_API_KEY || '',
        baseURL: 'https://api.mistral.ai/v1',
    });

    try {
        const result = await generateObject({
            model: mistral('mistral-large-latest'),
            system: data, // SYSTEM PROMPT AS ABOVE - OMITTED FOR BREVITY
            prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
            schema: z.object({
                query: z.string(),
            }),
        });
        return result.object.query;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to generate query');
    }
};