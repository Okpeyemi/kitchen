/**
 * TheMealDB API Client
 * Free API Endpoints: https://www.themealdb.com/api.php
 */

export const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// ============ TYPES ============

export type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strTags: string | null;
    strYoutube: string | null;
    strSource: string | null;
    [key: string]: string | null; // For strIngredient1-20, strMeasure1-20, etc.
};

export type MealPreview = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export type Category = {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
};

export type CategoryName = {
    strCategory: string;
};

export type Area = {
    strArea: string;
};

export type Ingredient = {
    idIngredient: string;
    strIngredient: string;
    strDescription: string | null;
    strType: string | null;
};

// ============ SEARCH ============

/**
 * Search meals by name
 * @param query - Search term (empty string returns all)
 */
export const searchMealsByName = async (query: string): Promise<Meal[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.meals || [];
};

/**
 * Search meals by first letter
 * @param letter - Single letter (a-z)
 */
export const searchMealsByFirstLetter = async (letter: string): Promise<Meal[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/search.php?f=${letter.charAt(0)}`);
    const data = await response.json();
    return data.meals || [];
};

// ============ LOOKUP ============

/**
 * Get full meal details by ID
 * @param id - Meal ID
 */
export const getMealById = async (id: string): Promise<Meal | null> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
};

/**
 * Get a single random meal
 */
export const getRandomMeal = async (): Promise<Meal | null> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/random.php`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
};

// ============ CATEGORIES ============

/**
 * Get all categories with descriptions and thumbnails
 */
export const getCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
};

/**
 * Get list of category names only (lightweight)
 */
export const getCategoryNames = async (): Promise<CategoryName[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/list.php?c=list`);
    const data = await response.json();
    return data.meals || [];
};

// ============ AREAS (CUISINES) ============

/**
 * Get list of all areas/cuisines (e.g., Italian, Mexican, etc.)
 */
export const getAreas = async (): Promise<Area[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/list.php?a=list`);
    const data = await response.json();
    return data.meals || [];
};

// ============ INGREDIENTS ============

/**
 * Get list of all ingredients
 */
export const getIngredients = async (): Promise<Ingredient[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/list.php?i=list`);
    const data = await response.json();
    return data.meals || [];
};

/**
 * Get ingredient thumbnail URL
 * @param ingredientName - Name of the ingredient
 * @param size - 'small' or 'medium'
 */
export const getIngredientThumbUrl = (ingredientName: string, size: 'small' | 'medium' = 'small'): string => {
    const sizeParam = size === 'small' ? '-Small' : '';
    return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredientName)}${sizeParam}.png`;
};

// ============ FILTERS ============

/**
 * Filter meals by category
 * @param category - Category name (e.g., "Seafood")
 */
    export const filterByCategory = async (category: string): Promise<MealPreview[]> => {
        const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await response.json();
        return data.meals || [];
    };

    /**
     * Filter meals by area/cuisine
     * @param area - Area name (e.g., "Italian")
     */
    export const filterByArea = async (area: string): Promise<MealPreview[]> => {
        const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
        const data = await response.json();
        return data.meals || [];
    };

    /**
     * Filter meals by main ingredient
     * @param ingredient - Ingredient name (e.g., "chicken_breast")
     */
    export const filterByIngredient = async (ingredient: string): Promise<MealPreview[]> => {
        const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
        const data = await response.json();
        return data.meals || [];
    };

// ============ HELPERS ============

/**
 * Extract ingredients and measures from a meal object
 * @param meal - Full meal object
 * @returns Array of { ingredient, measure } objects
 */
export const extractIngredients = (meal: Meal): { ingredient: string; measure: string }[] => {
    const ingredients: { ingredient: string; measure: string }[] = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push({
                ingredient: ingredient.trim(),
                measure: measure?.trim() || ''
            });
        }
    }

    return ingredients;
};

// ============ LEGACY ALIASES (for backward compatibility) ============

/** @deprecated Use searchMealsByName instead */
export const searchRecipes = searchMealsByName;

/** @deprecated Use getMealById instead */
export const getRecipeById = getMealById;
