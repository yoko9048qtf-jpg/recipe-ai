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

// 食品ロス削減の特設ページ（Section3: ふるさと納税商品紹介。将来的に楽天アフィリエイトへ接続予定）
export type SpecialView = "food-loss";

// ふるさと納税商品の絞り込み軸
export type FoodType = "meat" | "seafood" | "vegetable" | "fruit" | "processed";
export type Region =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku-shikoku"
  | "kyushu-okinawa";
export type PriceRange = "under-5000" | "5001-10000" | "10001-30000" | "over-30001";
export type ProductFilterKind = "food-type" | "region" | "price";

export interface ProductFilterState {
  kind: ProductFilterKind;
  foodType: FoodType;
  region: Region;
  priceRange: PriceRange;
}

// ふるさと納税商品（楽天市場APIから取得。server/rakutenIchiba.js がAPIレスポンスをこの型に変換する）
export interface FoodLossProduct {
  id: string;
  name: string; // 商品名
  municipality: string; // 自治体名（楽天の店舗名からの近似値）
  quantity: string; // 内容量（楽天の商品説明文からの近似値）
  donationAmount: number; // 寄付金額（円）
  aiInsight: string; // 食品ロス削減効果のAI分析（現状はキーワードによる固定文言。楽天APIからは取得不可）
  foodType: FoodType;
  region: Region;
  priceRange: PriceRange;
  imageUrl?: string; // 商品写真URL（未取得時はカテゴリ別のプレースホルダーを表示）
  affiliateUrl?: string; // 楽天アフィリエイトURL（RAKUTEN_AFFILIATE_ID設定時のみ）
  itemUrl?: string; // 楽天市場の通常商品URL（affiliateUrl未設定時のフォールバック）
}
