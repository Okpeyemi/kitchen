export const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    [key: string]: string | null; // For strIngredient1, strMeasure1, etc.
};

export const searchRecipes = async (query: string): Promise<Meal[]> => {
    const url = query
        ? `${THEMEALDB_BASE_URL}/search.php?s=${query}`
        : `${THEMEALDB_BASE_URL}/search.php?s=`; // Default search returns some items

    const response = await fetch(url);
    const data = await response.json();
    return data.meals || [];
};

export const getRecipeById = async (id: string): Promise<Meal | null> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
};

export const getCategories = async (): Promise<any[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
};

export const filterByCategory = async (category: string): Promise<Meal[]> => {
    const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
};
