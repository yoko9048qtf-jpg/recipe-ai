import type { Recipe } from "../types";

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

  return (
    <div className="recipe-list">
      {recipes.map((r) => (
        <button key={r.id} type="button" className="recipe-card" onClick={() => onSelect(r)}>
          {r.image ? <img src={r.image} alt={r.title} loading="lazy" /> : null}
          <div className="recipe-card-body">
            <h3>{r.title}</h3>
            <div className="badges">
              <span className="badge have">使える食材 {r.usedCount}</span>
              <span className="badge missing">不足 {r.missedCount}</span>
            </div>
            {r.indication && <p className="missing-preview">⏱ {r.indication}</p>}
            {r.missingMaterials.length > 0 && (
              <p className="missing-preview">
                不足: {r.missingMaterials.slice(0, 5).join("、")}
                {r.missingMaterials.length > 5 ? " ほか" : ""}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
