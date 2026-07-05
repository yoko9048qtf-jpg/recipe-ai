import type { PolicyView } from "./types";

// お問い合わせフォーム（Google Forms）のURL。
// フォームを差し替える場合はこの値だけを更新すればよい。
export const GOOGLE_FORM_URL = "https://forms.gle/REPLACE_WITH_YOUR_FORM_ID";

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
