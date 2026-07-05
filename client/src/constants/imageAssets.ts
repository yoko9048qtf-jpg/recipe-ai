// 画像パスの一元管理。
// すべて public 基準の相対パス（例: "/assets/images/foo.jpg"）で管理する。
// 画像は後日 client/public/assets/images に配置される想定のため、
// 未配置の間は各コンポーネント側で ImageWithFallback を使い、
// 読み込み失敗時に CSS グラデーションのプレースホルダーへ自動的に切り替える。

export const IMAGE_ASSETS = {
  // 既存（配置済み・変更しない）
  heroTop: "/assets/images/hero.png",
  brandIcon: "/assets/images/icon.png",

  // 食品ロス特集ページ
  foodLossHero: "/assets/images/foodloss-hero.png",
  foodLossBanner: "/assets/images/foodloss-banner.png",
  vegetables: "/assets/images/vegetables.png",
  furusatoFoods: "/assets/images/furusato-foods.png",
} as const;

export type ImageAssetKey = keyof typeof IMAGE_ASSETS;
