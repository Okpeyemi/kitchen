import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export type ExtractedRecipe = {
    title: string;
    ingredients: Array<{ name: string; amount: string }>;
    instructions: string;
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
                    google_search_retrieval: {
                        dynamic_retrieval_config: {
                            mode: "MODE_DYNAMIC",
                            dynamic_threshold: 0.7,
                        }
                    }
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
