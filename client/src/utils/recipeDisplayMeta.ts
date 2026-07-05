import type { Recipe } from "../types";

/**
 * タイトルからカテゴリ表示ラベルを推測する（表示専用の簡易ヒューリスティック）。
 * サーバー側のスコアリング・主菜優先・カテゴリ補正ロジック（server/app.js）とは無関係で、
 * 並び替え・件数・レシピ選定には一切影響しない。あくまでカード上のラベル表示のみに使う。
 */
const STAPLE_HINTS = ["ご飯", "丼", "麺", "パスタ", "うどん", "そば", "チャーハン", "リゾット"];
const SIDE_HINTS = ["サラダ", "汁", "スープ", "和え", "漬け", "浸し"];

export function guessCategoryLabel(title: string): string {
  if (STAPLE_HINTS.some((h) => title.includes(h))) return "主食";
  if (SIDE_HINTS.some((h) => title.includes(h))) return "副菜";
  return "主菜";
}

/**
 * 一覧の中で最も冷蔵庫の食材を多く使えるレシピを「AIおすすめ」として1件だけ強調する。
 * usedCount は既存のAPIレスポンスに含まれる実データで、新しい取得・fabricationは行わない。
 */
export function pickAiRecommendedId(recipes: Recipe[]): Recipe["id"] | null {
  if (recipes.length === 0) return null;
  let best = recipes[0];
  for (const r of recipes) {
    if (r.usedCount > best.usedCount) best = r;
  }
  return best.id;
}
