import type { RecipesResponse, Cuisine, RecipeDetailData } from "./types";
import { getRecipeHistory } from "./utils/recipeHistory";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `エラーが発生しました (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/** 食材（日本語）と気分（和食/洋食）からおすすめレシピを取得 */
export async function fetchRecipes(
  ingredients: string[],
  cuisine: Cuisine
): Promise<RecipesResponse> {
  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, cuisine, history: getRecipeHistory() }),
  });
  return handle<RecipesResponse>(res);
}

/** レシピ名・材料・人数から、指定人数分の材料（分量つき）と作り方（AI生成）を取得 */
export async function fetchRecipeDetail(
  title: string,
  materials: string[],
  servings: number,
  have: string[]
): Promise<RecipeDetailData> {
  const res = await fetch("/api/recipe-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, materials, servings, have }),
  });
  return handle<RecipeDetailData>(res);
}

/** 写真（data URL）から食材を抽出 */
export async function detectIngredients(imageDataUrl: string): Promise<string[]> {
  const res = await fetch("/api/detect-ingredients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl }),
  });
  const data = await handle<{ ingredients: string[] }>(res);
  return data.ingredients;
}
