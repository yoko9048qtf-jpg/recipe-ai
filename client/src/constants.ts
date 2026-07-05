import type { FoodType, PolicyView, PriceRange, ProductFilterKind, Region } from "./types";

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

// ===== 食品ロス特設ページ（/food-loss）本文 =====
// 見出し・本文はすべてここに集約し、文言変更がこのファイルの編集のみで完結するようにしている。
export const FOOD_LOSS_PAGE_TITLE = "食品ロス特集";

export const FOOD_LOSS_PAGE_CONTENT = {
  section1: {
    title: "食品ロスってどんな問題？",
    subtitle: "まだ食べられる食品が、毎日たくさん捨てられています。",
    impactJapan: { value: "約472万トン", label: "日本の年間食品ロス量" },
    impactWorld: { value: "約9.31億トン", label: "世界の年間食品ロス量" },
    householdTitle: "実は、食品ロスの約半分は家庭から発生しています。",
    household: {
      emoji: "🏠",
      label: "家庭",
      percent: "約50%",
      reasons: ["買いすぎ", "期限切れ", "作りすぎ"],
    },
    business: {
      emoji: "🏪",
      label: "お店・企業",
      percent: "約50%",
    },
    transition: "食品ロスは、毎日のちょっとした工夫で減らすことができます。",
  },
  section2: {
    title: "今ある食材をムダなく使おう",
    subtitle: "冷蔵庫にある食材を活かして、おいしく使い切るお手伝いをします。",
    flow: {
      ingredients: ["卵", "キャベツ", "ご飯"],
      result: "チャーハン",
      caption: "余った食材が、おいしい一品に。",
    },
    assistTitle: "買いすぎも防げます",
    assistBody:
      "冷蔵庫にある食材を優先してレシピを提案するため、\n不要な買い足しを減らすことができます。",
    transition: "家庭で食品を使い切ることも大切ですが、\n食品ロスを減らすためには「どんな食品を選ぶか」も大切です。",
  },
  section3: {
    title: "食品ロスを減らす商品を探してみよう",
    subtitle: "ふるさと納税を通じて、\n食品ロス削減につながる商品を紹介します。",
    explainTitle: "ふるさと納税が食品ロス削減につながる理由",
    explainReasons: [
      "規格外品や余剰食材を活用できる",
      "地域で大切に育てられた食材を無駄なく届けられる",
      "地域を応援しながら食品ロス削減にも貢献できる",
    ],
    productCta: "楽天市場で詳しく見る",
    // 内容量が取得できなかった場合の表示文言（商品説明文の代替表示は行わない）
    quantityFallback: "商品ページをご確認ください",
  },
  closing: {
    title: "食品ロス削減は、\n「使い切ること」だけではありません。",
    body:
      "毎日の料理で食材を使い切ること。\n\nそして、食品ロス削減につながる商品を選ぶこと。\n\n" +
      "その小さな選択が、未来の食品ロス削減につながります。",
  },
} as const;

// 「食品ロス削減につながる理由」カード（食品ロス特集ページ・商品詳細ポップアップ共通）
export const FOOD_LOSS_REASON_CARDS = [
  { icon: "🌾", title: "規格外品を有効活用", body: "市場に流通しにくい食材を活かします" },
  { icon: "♻️", title: "廃棄を削減", body: "まだ食べられる食品を無駄にしません" },
  { icon: "🧑‍🌾", title: "生産者・地域を応援", body: "地域の農家さんを支えます" },
] as const;

// 商品フィルターの軸（ラジオボタン）。初期表示は「食品種類」
export const FILTER_KIND_OPTIONS: { value: ProductFilterKind; label: string }[] = [
  { value: "food-type", label: "食品種類" },
  { value: "region", label: "地域別" },
  { value: "price", label: "金額別" },
];

export const FOOD_TYPE_OPTIONS: { value: FoodType; label: string; emoji: string }[] = [
  { value: "meat", label: "肉", emoji: "🥩" },
  { value: "seafood", label: "海鮮", emoji: "🐟" },
  { value: "vegetable", label: "野菜", emoji: "🥦" },
  { value: "fruit", label: "果物", emoji: "🍎" },
  { value: "processed", label: "加工食品", emoji: "🥫" },
];

export const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "hokkaido", label: "北海道" },
  { value: "tohoku", label: "東北" },
  { value: "kanto", label: "関東" },
  { value: "chubu", label: "中部" },
  { value: "kinki", label: "近畿" },
  { value: "chugoku-shikoku", label: "中国・四国" },
  { value: "kyushu-okinawa", label: "九州・沖縄" },
];

export const PRICE_RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "under-5000", label: "〜5,000円" },
  { value: "5001-10000", label: "5,001〜10,000円" },
  { value: "10001-30000", label: "10,001〜30,000円" },
  { value: "over-30001", label: "30,001円以上" },
];
