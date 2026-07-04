import { useEffect, useState } from "react";
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import RecipeDetailView from "./components/RecipeDetail";
import { fetchRecipes } from "./api";
import type { Recipe, Cuisine } from "./types";

type View = "input" | "list" | "detail";

export default function App() {
  const [view, setView] = useState<View>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  // 詳細（材料の分量・不足判定）に使う、検索時の食材と人数を保持
  const [haveIngredients, setHaveIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);

  // 画面遷移ごとに先頭へスクロール（スマホアプリのような遷移感）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  async function handleSearch(ingredients: string[], cuisine: Cuisine, people: number) {
    setError("");
    setLoading(true);
    try {
      const data = await fetchRecipes(ingredients, cuisine);
      setRecipes(data.recipes);
      setHaveIngredients(ingredients);
      setServings(people);
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  // 楽天はランキング応答に材料まで含むため、詳細取得のAPI呼び出しは不要
  function handleSelect(recipe: Recipe) {
    setSelected(recipe);
    setView("detail");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 AI×レシピメーカー</h1>
        <p className="tagline">冷蔵庫の中身から、作れるレシピと足りない材料がわかります</p>
      </header>

      {error && <div className="banner-error">{error}</div>}

      <main>
        {view === "input" && (
          <IngredientInput loading={loading} onSubmit={handleSearch} />
        )}

        {view === "list" && (
          <div className="list-view">
            <button type="button" className="back" onClick={() => setView("input")}>
              ← 食材の入力に戻る
            </button>
            <h2>おすすめレシピ</h2>
            {loading ? (
              <p className="loading">読み込み中…</p>
            ) : (
              <RecipeList recipes={recipes} onSelect={handleSelect} />
            )}
          </div>
        )}

        {view === "detail" && selected && (
          <RecipeDetailView
            detail={selected}
            servings={servings}
            have={haveIngredients}
            onBack={() => setView("list")}
          />
        )}
      </main>

      <footer className="app-footer">レシピ: 楽天レシピ / 画像認識: Claude</footer>
    </div>
  );
}
