import type { PolicyView } from "./types";

// お問い合わせフォーム（Google Forms）のURL。
// フォームを差し替える場合はこの値だけを更新すればよい。
export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSexCNcZS_BFpXjUcW-9vWM8Gr42SiFVpV1WGm3NLJUV0Mcngg/viewform?usp=publish-editor";

// サービス名（屋号）
export const SERVICE_NAME = "Sustainable Recipe Maker";

// Footerの静的ページ: view と URLパス・表示ラベルの対応（App.tsx / Footer.tsx で共有）
export const POLICY_PATHS: Record<PolicyView, string> = {
  privacy: "/privacy",
  terms: "/terms",
  "ai-policy": "/ai-policy",
  copyright: "/copyright",
  contact: "/contact",
};

export const POLICY_LABELS: Record<PolicyView, string> = {
  privacy: "プライバシーポリシー",
  terms: "利用規約",
  "ai-policy": "AI利用に関する注意事項",
  copyright: "著作権・引用ポリシー",
  contact: "お問い合わせ",
};

// ===== 食品ロス削減 特設ページ導線 =====
// 特設ページは未実装（Coming Soon）。将来的に楽天ふるさと納税・食品ロス特集ページ等の
// 外部URLに差し替える前提のため、遷移先はこのパス1箇所に集約している
// （差し替え時はApp.tsxのhandleFoodLossClickの遷移方法を変えるだけでよい）。
export const FOOD_LOSS_PATH = "/food-loss";

// ヘッダー右上の導線ボタンのアイコン＋ラベル（FoodLossButtonは両方を必須propsとして受け取り、
// アイコン単体・ラベル省略を禁止している。差し替えはこの2定数の変更のみで完結する）
export const FOOD_LOSS_ICON = "🌱";
export const FOOD_LOSS_HEADER_LABEL = "食品ロスを減らそう";

// トップページ・ヒーロー直下バナー
export const FOOD_LOSS_BANNER_TITLE = "食品ロスを減らす、新しい選択。";
export const FOOD_LOSS_BANNER_BODY =
  "余った食材を使い切るだけでなく、規格外や訳あり食材を選ぶことも、食品ロス削減につながります。\n" +
  "食品ロスについて知り、一緒にできることから始めましょう。";
export const FOOD_LOSS_BANNER_CTA = "食品ロス特集を見る";

// レシピ回答ページ下部バナー
export const FOOD_LOSS_RECIPE_BANNER_TITLE = "🌱 食品ロスを減らそう";
export const FOOD_LOSS_RECIPE_BANNER_BODY =
  "今日の一皿に加えて、食品ロス削減につながる食材も選んでみませんか。\n" +
  "できることから、一緒に始めましょう。";

// 特設ページ（Coming Soon）
export const FOOD_LOSS_PAGE_TITLE = "食品ロス特集";
export const FOOD_LOSS_COMING_SOON_TEXT =
  "現在、特設ページを準備中です。近日公開予定ですので、もうしばらくお待ちください。";
