import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export type ExtractedRecipe = {
    title: string;
    ingredients: Array<{ name: string; amount: string }>;
    instructions: string;
};

export type IngredientAnalysis = {
    missingIngredients: Array<{ name: string; amount: string }>;
    matchingIngredients: Array<{ name: string; amount: string; fridgeItem?: string }>;
    recipe: ExtractedRecipe;
};

/**
 * Analyzes a recipe image using Gemini 3 Flash Preview and extracts recipe information
 * @param imageUri - Local URI of the image to analyze
 * @returns Extracted recipe data
 */
export async function analyzeRecipeImage(imageUri: string): Promise<ExtractedRecipe> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    // Read image as base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
    });

    // Determine mime type from extension
    const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    const prompt = `Analyze this image which is either a recipe (text) OR a photo of a dish (food).

1. If it's a specific recipe text (e.g. from a book or screen), extract the title, ingredients, and instructions exactly as written.
2. If it's a photo of a prepared dish, IDENTIFY the dish. Then, USE THE SEARCH TOOL to find a highly rated, authentic recipe for this specific dish. Deduce the ingredients and instructions from the search results to ensure accuracy (cooking times, temperatures, specific spices).

Return the result in this JSON format:
{
  "title": "Recipe name",
  "ingredients": [
    { "name": "ingredient name", "amount": "quantity with unit" }
  ],
  "instructions": "Step by step instructions as a single string",
  "is_inferred": boolean (true if from food photo, false if from text)
}

Important:
- For food photos: provide realistic quantities and standard cooking steps based on SEARCH RESULTS.
- Respond ONLY with valid JSON, no markdown or extra text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image,
                            },
                        },
                    ],
                },
            ],
            tools: [
                {
                    google_search: {}
                }
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 16384,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text from response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Log raw response for debugging
    console.log('=== GEMINI RAW RESPONSE ===');
    console.log(responseText);
    console.log('=== END GEMINI RESPONSE ===');

    if (!responseText) {
        throw new Error('No response from Gemini API');
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonString = responseText.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7);
    }
    if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3);
    }
    jsonString = jsonString.trim();

    try {
        const parsed = JSON.parse(jsonString);
        let instructions = parsed.instructions || '';

        // Append marker if inferred from photo
        if (parsed.is_inferred) {
            instructions += '\n\n<!--AI-->';
        }

        return {
            title: parsed.title || 'Untitled Recipe',
            ingredients: parsed.ingredients || [],
            instructions: instructions,
        };
    } catch (e) {
        console.error('Failed to parse Gemini response:', jsonString);
        throw new Error('Failed to parse recipe data from image');
    }
}

/**
 * Generates an engaging description for a recipe using Gemini AI
 * @param recipeInfo - Object containing recipe details
 * @returns Generated description string
 */
export async function generateRecipeDescription(recipeInfo: {
    title: string;
    category?: string;
    area?: string;
    ingredients: string[];
    imageUrl?: string;
}): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    const prompt = `Generate an engaging and appetizing description for this recipe in French:

Recipe: ${recipeInfo.title}
${recipeInfo.category ? `Category: ${recipeInfo.category}` : ''}
${recipeInfo.area ? `Cuisine: ${recipeInfo.area}` : ''}
Ingredients: ${recipeInfo.ingredients.slice(0, 10).join(', ')}

Write a 2-3 sentence description that:
- Describes the dish's flavors and textures
- Mentions the cuisine origin if available
- Makes the reader want to try it
- Is written in a warm, inviting tone

Respond with ONLY the description text, no quotes or formatting.`;

    const requestBody: any = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
        },
    };

    // Add image if available
    if (recipeInfo.imageUrl) {
        try {
            const imageResponse = await fetch(recipeInfo.imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = btoa(
                new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            requestBody.contents[0].parts.push({
                inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                },
            });
        } catch (e) {
            console.log('Could not fetch image for description, continuing without it');
        }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
        throw new Error('No response from Gemini API');
    }

    return responseText.trim();
}

/**
 * Formats recipe instructions into a clean Markdown list using Gemini AI
 * @param instructions - Raw instruction text
 * @returns Formatted markdown string
 */
export async function formatRecipeInstructions(instructions: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    const prompt = `Format the following cooking instructions into a clear, easy-to-read Markdown format.
Use a numbered list for steps.
Bold key actions (e.g., **Chop**, **Boil**, **Simmer**) and ingredients/quantities mentioned in the steps.
If there are logical sections (e.g., "Preparation", "Cooking", "Serving"), use H3 (###) headers.
Do not add any introductory or concluding text, just the formatted instructions.

Raw instructions:
${instructions}`;

    const requestBody: any = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.2, // Lower temperature for more consistent formatting
            maxOutputTokens: 8192,
        },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
        throw new Error('No response from Gemini API');
    }

    return responseText.trim();
}

/**
 * Analyzes a recipe from a video/page URL and compares with fridge ingredients
 * @param url - The URL to analyze
 * @param userId - The ID of the authenticated user
 * @param htmlContent - Optional raw HTML content of the page (faster than searching)
 * @returns Analysis result with recipe details and missing/matching ingredients
 */
export async function analyzeRecipeFromUrl(url: string, userId: string, htmlContent?: string): Promise<IngredientAnalysis> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    // Fetch user's fridge ingredients directly from Supabase for strict verification
    const { data: fridgeData, error } = await supabase
        .from('user_fridge')
        .select('name')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching fridge items:', error);
        throw new Error('Failed to verify fridge inventory');
    }

    const fridgeIngredients = (fridgeData || []).map(item => item.name);
    const fridgeList = fridgeIngredients.map(i => `- ${i}`).join('\n');
    let prompt;

    if (htmlContent) {
        // Simple HTML cleaner to reduce tokens
        const cleanHtml = (html: string) => {
            return html
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gim, "")
                .replace(/<!--[\s\S]*?-->/g, "")
                .replace(/\s+/g, " ")
                .trim();
        };

        const cleanedHtml = cleanHtml(htmlContent);

        // Optimization: Use provided HTML instead of searching
        prompt = `I have the raw HTML content of a recipe page for URL: "${url}".
        
1.  EXTRACT the recipe details (Title, Ingredients, Instructions) directly from the provided HTML below.
2.  I also have these ingredients in my fridge:
${fridgeList}

3.  COMPARE the recipe's required ingredients with my fridge ingredients.
    - Identify which ingredients I ALREADY HAVE (matchingIngredients).
    - Identify which ingredients I AM MISSING and need to buy (missingIngredients).
    - STRICTLY match ingredients. Do NOT assume I have ANY items (including salt, oil, water, pepper, sugar) unless they are in the fridge list.
    - If "Water" is in the recipe but not in the fridge list, it is MISSING.
    - Allow for minor linguistic variations (e.g., "Eggs" matches "Egg", "Diced Onions" matches "Onion").
    
4.  Return the result in this JSON format:
{
  "recipe": {
    "title": "Recipe Name",
    "ingredients": [ { "name": "ingredient name", "amount": "quantity" } ],
    "instructions": "Full instructions in Markdown"
  },
  "missingIngredients": [ { "name": "ingredient name", "amount": "quantity needed" } ],
  "matchingIngredients": [ { "name": "ingredient name", "amount": "quantity needed", "fridgeItem": "name of item in fridge that matched" } ]
}

Raw HTML Content:
${cleanedHtml.substring(0, 30000)} ... (truncated)`; // Reduced to 30k chars after cleaning

    } else {
        // Fallback: Use Search Tool
        prompt = `I have a recipe URL: "${url}".
    
1.  Use the SEARCH TOOL to find the recipe details (Title, Ingredients, Instructions) associated with this URL or video. Use the context from the URL to find the correct recipe.
2.  I also have these ingredients in my fridge:
${fridgeList}

3.  COMPARE the recipe's required ingredients with my fridge ingredients.
    - Identify which ingredients I ALREADY HAVE (matchingIngredients).
    - Identify which ingredients I AM MISSING and need to buy (missingIngredients).
    - STRICTLY match ingredients. Do NOT assume I have ANY items (including salt, oil, water, pepper, sugar) unless they are in the fridge list.
    - If "Water" is in the recipe but not in the fridge list, it is MISSING.
    - Allow for minor linguistic variations (e.g., "Eggs" matches "Egg", "Diced Onions" matches "Onion").
    
4.  Return the result in this JSON format:
{
  "recipe": {
    "title": "Recipe Name",
    "ingredients": [ { "name": "ingredient name", "amount": "quantity" } ],
    "instructions": "Full instructions in Markdown"
  },
  "missingIngredients": [ { "name": "ingredient name", "amount": "quantity needed" } ],
  "matchingIngredients": [ { "name": "ingredient name", "amount": "quantity needed", "fridgeItem": "name of item in fridge that matched" } ]
}

Respond ONLY with valid JSON.`;
    }

    const requestBody: any = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        // Only trigger tools if no HTML provided
        tools: htmlContent ? [] : [
            {
                google_search: {}
            }
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
        },
        safetySettings: [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('=== GEMINI URL ANALYSIS RAW ===');
    console.log(responseText ? 'Response received' : 'No response text');
    if (!responseText) {
        console.log('FULL RESPONSE DATA:', JSON.stringify(data, null, 2));
    }
    // console.log(responseText); // Potentially huge log
    console.log('=== END RAW ===');

    if (!responseText) {
        throw new Error('No response from Gemini API - Check logs for "FULL RESPONSE DATA"');
    }

    // Parse JSON
    let jsonString = responseText.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7);
    }
    if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3);
    }
    if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3);
    }
    jsonString = jsonString.trim();

    try {
        const parsed = JSON.parse(jsonString);
        return {
            recipe: parsed.recipe,
            missingIngredients: parsed.missingIngredients || [],
            matchingIngredients: parsed.matchingIngredients || []
        };
    } catch (e) {
        console.error('Failed to parse Gemini response:', jsonString);
        throw new Error('Failed to parse analysis results');
    }
}
