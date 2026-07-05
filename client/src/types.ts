// 気分（料理のジャンル）
export type Cuisine = "japanese" | "western" | "chinese" | "italian";

// 気分の選択肢（表示用）
export const CUISINE_OPTIONS: { value: Cuisine; emoji: string; label: string }[] = [
  { value: "japanese", emoji: "🍚", label: "和食" },
  { value: "western", emoji: "🍴", label: "洋食" },
  { value: "chinese", emoji: "🥟", label: "中華" },
  { value: "italian", emoji: "🍝", label: "イタリアン" },
];

// 楽天レシピ1件
export interface Recipe {
  id: number | string;
  title: string; // 日本語
  image: string;
  url: string; // 楽天レシピの作り方ページ
  indication: string; // 調理時間（例: 約15分）
  cost: string; // 費用目安（例: 300円前後）
  materials: string[]; // 必要な材料（日本語・原文）
  missingMaterials: string[]; // 不足している材料
  usedCount: number; // 冷蔵庫の食材をいくつ使うか
  missedCount: number; // 不足材料数
}

export interface RecipesResponse {
  recipes: Recipe[];
}

// レシピ詳細（指定人数分・AI生成）
export interface DetailIngredient {
  name: string;
  amount: string; // 例: 300g, 大さじ2, 1個
  missing: boolean; // 冷蔵庫にない＝買い物が必要
}

export interface RecipeDetailData {
  servings: number;
  ingredients: DetailIngredient[];
  steps: string[];
}

// Footerからリンクする静的ポリシーページ
export type PolicyView = "privacy" | "terms" | "ai-policy" | "copyright" | "contact";

// 食品ロス削減の特設ページ（現時点ではComing Soon。将来的に外部特集ページ等に差し替え予定）
export type SpecialView = "food-loss";
