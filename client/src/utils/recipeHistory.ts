const HISTORY_KEY = "recipeHistory";
const HISTORY_LIMIT = 10;

type RecipeId = number | string;

/** localStorage に保存された直近表示レシピIDの履歴を取得する（新しい順） */
export function getRecipeHistory(): RecipeId[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is RecipeId => typeof id === "number" || typeof id === "string"
    );
  } catch {
    return [];
  }
}

/**
 * 新しく表示したレシピIDを履歴の先頭に追加する。
 * 重複は除去し、先頭優先で最大 HISTORY_LIMIT 件まで保持する。
 */
export function addRecipesToHistory(ids: RecipeId[]): void {
  const existing = getRecipeHistory();
  const seen = new Set<RecipeId>();
  const merged: RecipeId[] = [];
  for (const id of [...ids, ...existing]) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(merged.slice(0, HISTORY_LIMIT)));
  } catch {
    // プライベートモード等で localStorage が使えない場合は履歴保存を諦める
  }
}
