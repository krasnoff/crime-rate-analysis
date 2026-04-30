"use server";

import path from 'path';
import { generateText, APICallError } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
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

    // Configure Ollama using OpenAI-compatible API
    const ollama = createOpenAI({
        baseURL: process.env.OLLAMA_BASE_URL,
        apiKey: process.env.OLLAMA_API_KEY, // Empty string for local Ollama instances
        headers: {
          Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
        },
    });

    console.log('Generating query for input:', ollama, input);

    if (!input) {
        throw new Error('Input cannot be empty');
    }
    
    try {
        const result = await generateText({
            model: ollama(process.env.OLLAMA_MODEL ?? 'gpt-oss:120b-cloud'), // Use your available model
            system: data, // SYSTEM PROMPT AS ABOVE - OMITTED FOR BREVITY
            prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
        });
        
        // Extract SQL query from the response
        const response = result.text;
        console.log('AI Response:', response);
        
        // Look for SQL query in code blocks or extract it
        let query = response;
        
        // Try to extract SQL from code blocks first
        const codeBlockMatch = response.match(/```(?:sql)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
            query = codeBlockMatch[1].trim();
        } else {
            // If no code block, look for SELECT or WITH statements
            const sqlMatch = response.match(/((?:WITH|SELECT)[\s\S]*?)(?:\n\n|$)/i);
            if (sqlMatch) {
                query = sqlMatch[1].trim();
            }
        }
        
        // Clean up the query - remove comments and extra text
        query = query
            .split('\n')
            .map(line => {
                // Remove single-line comments (-- style)
                const commentIndex = line.indexOf('--');
                if (commentIndex !== -1) {
                    line = line.substring(0, commentIndex);
                }
                return line.trim();
            })
            .filter(line => line.length > 0)
            .join(' ')
            // Remove multi-line comments (/* */ style)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove any explanatory text before SELECT/WITH
            .replace(/^.*?((?:WITH|SELECT))/i, '$1')
            // Clean up extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
        
        if (!query) {
            throw new Error('No SQL query found in response');
        }
        
        console.log('Extracted Query:', query);
        return query;
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