import type { Recipe } from "../types";
import { Card, Badge } from "./common";
import { guessCategoryLabel } from "../utils/recipeDisplayMeta";

interface Props {
  recipe: Recipe;
  isAiPick: boolean;
  onSelect: (recipe: Recipe) => void;
}

/** レシピ一覧・写真主役のギャラリーカード。既存のAPIレスポンス（Recipe型）のみを使用する。 */
export default function RecipeCard({ recipe: r, isAiPick, onSelect }: Props) {
  return (
    <Card as="button" interactive padding="none" className="recipe-card" onClick={() => onSelect(r)}>
      <div className="recipe-card-media">
        {r.image ? (
          <img src={r.image} alt={r.title} loading="lazy" className="recipe-card-img" />
        ) : (
          <div className="ds-image-fallback recipe-card-img" role="img" aria-label={r.title}>
            <span>🍳</span>
          </div>
        )}
        {isAiPick && (
          <Badge tone="special" className="recipe-card-badge-ai">
            ✨ AIおすすめ
          </Badge>
        )}
        <Badge tone="neutral" className="recipe-card-badge-cat">
          {guessCategoryLabel(r.title)}
        </Badge>
        <span className="recipe-card-cta-overlay">この一品を作ってみる →</span>
      </div>
      <div className="recipe-card-body">
        <h2>{r.title}</h2>
        <div className="recipe-card-meta-row">
          {r.indication && <span className="recipe-card-meta-chip">⏱ {r.indication}</span>}
          {r.cost && <span className="recipe-card-meta-chip">💰 {r.cost}</span>}
        </div>
        <div className="badges">
          <span className="badge have">使える食材 {r.usedCount}</span>
          <span className="badge missing">不足 {r.missedCount}</span>
        </div>
        {r.missingMaterials.length > 0 && (
          <p className="missing-preview">
            不足: {r.missingMaterials.slice(0, 5).join("、")}
            {r.missingMaterials.length > 5 ? " ほか" : ""}
          </p>
        )}
      </div>
    </Card>
  );
}
