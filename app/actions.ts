"use server";

import path from 'path';
import { z } from 'zod';
import { generateObject, APICallError } from 'ai';
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { sql } from "@vercel/postgres";
import { Result } from '@/types/result';

export async function readSystemPrompt(url: string) {
  'use server';
  const filePath = path.join(process.cwd(), 'data', url);
  console.log('Reading system prompt from:', filePath);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data/system-prompt.txt`);
    const data = await response.text();
    return data;
  } catch (err) {
    console.error('Error reading system prompt:', err);
    throw err;
  }
}

export const generateQuery = async (input: string) => {
    'use server';

    const data = await readSystemPrompt('system-prompt.txt'); 

    const google = createGoogleGenerativeAI({
        // custom settings
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });

    if (!input) {
        throw new Error('Input cannot be empty');
    }
    
    try {
        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            providerOptions: {
              google: {
                thinkingConfig: {
                  thinkingBudget: -1,
                },
              } satisfies GoogleGenerativeAIProviderOptions,
            },
            system: data, // SYSTEM PROMPT AS ABOVE - OMITTED FOR BREVITY
            prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
            schema: z.object({
                query: z.string(),
            }),
        });
        return result.object.query;
    } catch (e) {
        
        if (APICallError.isInstance(e)) {
            // Handle the error
            console.error('API call error:', e.message);
            console.error('Status code:', e.statusCode);   
            console.error('data:', e.data); 
            console.error('Response body:', e.responseBody);
            throw new Error(`API call failed: ${e}`);
        }

        throw new Error('Failed to generate query');
    }
};

/**
 * Executes a SQL query and returns the result data
 * @param {string} query - The SQL query to execute
 * @returns {Promise<Result[]>} Array of query results
 * @throws {Error} If query is not a SELECT statement or table doesn't exist
 */
export const runGeneratedSQLQuery = async (query: string) => {
  "use server";
  // Ensure the query is a SELECT statement. Otherwise, throw an error
  if (
    !(query.trim().toLowerCase().startsWith("select") || query.trim().toLowerCase().startsWith("with")) ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("insert") ||
    query.trim().toLowerCase().includes("update") ||
    query.trim().toLowerCase().includes("alter") ||
    query.trim().toLowerCase().includes("truncate") ||
    query.trim().toLowerCase().includes("create") ||
    query.trim().toLowerCase().includes("grant") ||
    query.trim().toLowerCase().includes("revoke")
  ) {
    throw new Error("Only SELECT queries are allowed");
  }

  let data: { rows: Result[] };
  try {
    data = await sql.query(query);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('relation "unicorns" does not exist')) {
      console.log(
        "Table does not exist, creating and seeding it with dummy data now...",
      );
      // throw error
      throw Error("Table does not exist");
    } else {
      throw e;
    }
  }

  console.log("Query executed successfully:", query);
  return data.rows as Result[];
};