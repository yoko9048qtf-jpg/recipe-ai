import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import RecipeDetailView from "./components/RecipeDetail";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import AiPolicy from "./components/AiPolicy";
import CopyrightPolicy from "./components/CopyrightPolicy";
import ContactPage from "./components/ContactPage";
import { fetchRecipes } from "./api";
import { addRecipesToHistory } from "./utils/recipeHistory";
import { POLICY_PATHS } from "./constants";
import type { Recipe, Cuisine, PolicyView } from "./types";

type View = "input" | "list" | "detail" | PolicyView;

/** URLパスから対応する画面を求める（一致しなければ食材入力画面） */
function viewFromPath(pathname: string): View {
  const entry = (Object.entries(POLICY_PATHS) as [PolicyView, string][]).find(
    ([, path]) => path === pathname
  );
  return entry ? entry[0] : "input";
}

export default function App() {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));
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

  // ブラウザの戻る/進むでURLが変わった際に画面を同期する（Footerのポリシーページ遷移用）
  useEffect(() => {
    function onPopState() {
      setView(viewFromPath(window.location.pathname));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 画面遷移とURLを同期する。ポリシーページは固有のパスを持ち、それ以外（入力/一覧/詳細）は "/" のまま
  function navigate(next: View) {
    const path = next in POLICY_PATHS ? POLICY_PATHS[next as PolicyView] : "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setError("");
    setView(next);
  }

  async function handleSearch(ingredients: string[], cuisine: Cuisine, people: number) {
    setError("");
    setLoading(true);
    try {
      const data = await fetchRecipes(ingredients, cuisine);
      setRecipes(data.recipes);
      addRecipesToHistory(data.recipes.map((r) => r.id));
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

  // ヘッダーのタイトルを押したら初期画面（食材入力）に戻る
  function handleGoHome() {
    navigate("input");
  }

  return (
    <>
      <Header onLogoClick={handleGoHome} />
      {view === "input" && <Hero />}

      <div className="app">
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
              <h1>おすすめレシピ</h1>
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

          {view === "privacy" && <PrivacyPolicy onBack={handleGoHome} />}
          {view === "terms" && <TermsOfService onBack={handleGoHome} />}
          {view === "ai-policy" && <AiPolicy onBack={handleGoHome} />}
          {view === "copyright" && <CopyrightPolicy onBack={handleGoHome} />}
          {view === "contact" && <ContactPage onBack={handleGoHome} />}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </>
  );
}
