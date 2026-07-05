import type { FoodType } from "../types";

/**
 * 食品種類ごとの一般的な食べ方の提案（ルールベース・固定文言）。
 * 商品固有のデータではなく、foodType区分のみを使った表示用の補足情報。
 */
const SUGGESTIONS_BY_FOOD_TYPE: Record<FoodType, string[]> = {
  meat: ["焼肉に", "煮込み料理に", "お弁当のおかずに"],
  seafood: ["お刺身に", "塩焼き・グリルに", "鍋料理に"],
  vegetable: ["炒め物に", "サラダに", "スープの具材に"],
  fruit: ["そのままデザートに", "スムージーに", "ジャムやコンポートに"],
  processed: ["そのまま食卓に", "お弁当に", "おつまみに"],
};

export function getFoodTypeSuggestions(foodType: FoodType): string[] {
  return SUGGESTIONS_BY_FOOD_TYPE[foodType] ?? SUGGESTIONS_BY_FOOD_TYPE.processed;
}
