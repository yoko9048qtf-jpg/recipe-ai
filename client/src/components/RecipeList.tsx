import type { Recipe } from "../types";
import RecipeCard from "./RecipeCard";
import { pickAiRecommendedId } from "../utils/recipeDisplayMeta";

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

export default function RecipeList({ recipes, onSelect }: Props) {
  if (recipes.length === 0) {
    return (
      <p className="empty">
        条件に合うレシピが見つかりませんでした。食材や気分を変えて試してください。
      </p>
    );
  }

  const usableIngredientCount = recipes.length > 0 ? Math.max(...recipes.map((r) => r.usedCount)) : 0;
  const aiPickId = pickAiRecommendedId(recipes);

  return (
    <>
      <div className="recipe-list-stats">
        <div className="recipe-list-stat">
          <span className="recipe-list-stat-value">{usableIngredientCount}</span>
          <span className="recipe-list-stat-label">使える食材</span>
        </div>
        <div className="recipe-list-stat">
          <span className="recipe-list-stat-value">{recipes.length}</span>
          <span className="recipe-list-stat-label">おすすめレシピ</span>
        </div>
      </div>
      <div className="recipe-list">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} isAiPick={r.id === aiPickId} onSelect={onSelect} />
        ))}
      </div>
    </>
  );
}
