import type { BadgeTone } from "../components/common/Badge";
import type { FoodLossProduct } from "../types";

export interface DerivedBadge {
  label: string;
  tone: BadgeTone;
}

/**
 * 商品名・自治体名・AI分析文言（既存データ、新規取得なし）から、
 * 表示用バッジをルールベースで導出する。UI装飾のみの処理で、
 * 商品名整形ロジック（productNameFormatter）・食品ロス分析ロジックの結果には影響しない。
 * 最大3件まで返す（カードが煩雑にならないようにするため）。
 */
export function deriveProductBadges(product: FoodLossProduct): DerivedBadge[] {
  const text = `${product.name} ${product.aiInsight}`;
  const badges: DerivedBadge[] = [];

  if (/訳あり|規格外/.test(text)) badges.push({ label: "規格外活用", tone: "bargain" });
  if (/数量限定|期間限定|先着/.test(text)) badges.push({ label: "数量限定", tone: "limited" });
  if (/人気|ランキング|完売|殺到/.test(text)) badges.push({ label: "人気", tone: "popular" });
  if (/産地直送|直送|朝採れ|採れたて/.test(text)) badges.push({ label: "産地直送", tone: "local" });
  if (/訳あり|規格外/.test(text) === false && /在庫|アウトレット|わけあり/.test(text)) {
    badges.push({ label: "在庫活用", tone: "bargain" });
  }

  if (badges.length === 0) badges.push({ label: "ふるさと納税", tone: "neutral" });

  return badges.slice(0, 3);
}
