# components.md

全コンポーネントは `client/src/` 配下。すべて関数コンポーネント + 名前付きProps interfaceの構成で統一されている。
状態管理ライブラリは使用せず、親から渡されるコールバック props で子→親のデータの流れを表現する。

2026-07-06に「企業サービス品質のUIブラッシュアップ」を実施し、`client/src/components/common/` に
デザインシステム共通コンポーネント（Button/Card/Badge等）を新設した。既存のAPI・データ構造・
ルーティング・各種ロジック（レシピ提案/商品名整形/食品ロス分析）は無変更。

## App（`client/src/App.tsx`）

- **用途**: アプリ全体のルート。画面遷移（`view: "input" | "list" | "detail" | PolicyView | SpecialView`）、
  URLとの同期、検索結果、選択中レシピ、検索条件（食材・人数）を一元管理する唯一のstateful componentコンポーネント。
- **Props**: なし（ルートコンポーネント）
- **利用画面**: 全画面（`main.tsx` からマウントされる唯一のエントリ）
- **保持するstate**: `view`, `loading`, `error`, `recipes: Recipe[]`, `selected: Recipe | null`,
  `haveIngredients: string[]`, `servings: number`
- **副作用**: 画面遷移毎に `window.scrollTo(top)`。検索成功時に `addRecipesToHistory()` を呼び出し
  localStorageへ表示履歴を保存。`popstate` イベントを監視し、ブラウザの戻る/進むに画面を同期
- **ルーティング**: `navigate(view)` がURL（`POLICY_PATHS` / `FOOD_LOSS_PATH`）とstateを同時に更新する
  自前の軽量ルーター（詳細は [architecture.md](./architecture.md) の「状態管理・ルーティング」参照）
- **レイアウト**: ルート要素はFragment。`Header`は全画面で常時表示。`Hero`は`view === "input"`、
  `FoodLossHero`は`view === "food-loss"`のときのみ、`.app`の外側（全幅・edge-to-edge）に表示する。
  `FoodLossBanner`も`view === "input"`のときのみ表示するが、こちらは`.app`（max-width 720px、
  デスクトップ1024px以上では1080px）の内側、`IngredientInput`の直前に配置する
- **`RecipeDetailView`への配線**: 既存の検索結果一覧（`recipes` state）をそのまま`relatedRecipes`propsとして渡し、
  関連レシピ表示のために新規API呼び出しは行わない
- **`handleFoodLossClick`**: 食品ロス特設ページへの導線（ヘッダー/トップページバナー/レシピ詳細ページ下部
  バナーで共通の遷移関数）。`navigate("food-loss")`で遷移する

## デザインシステム共通コンポーネント（`client/src/components/common/`）

全画面で再利用する見た目の基本部品。角丸・影・余白・フォントサイズは `client/src/index.css` の
`:root` に定義したデザイントークン（`--radius-*` `--shadow-*` `--space-*` `--fs-*` 等）を参照する。

| コンポーネント | 用途 | 主なProps |
|---|---|---|
| `Button` | 共通ボタン（`variant`: primary/secondary/ghost/line、`as="a"`でリンクにも変換可） | `variant`, `size`, `fullWidth`, `icon`, `as` |
| `Card` | 白カードの共通土台（`as="button"`でクリッカブルカードにも変換可） | `padding`, `interactive`, `as` |
| `Badge` | ルールベースで生成する丸ピルバッジ（`tone`: bargain/popular/limited/local/special/neutral） | `tone`, `icon` |
| `SectionHeader` | セクション見出し（アイキャッチ小見出し＋タイトル＋補足文） | `eyebrow`, `title`, `subtitle`, `align` |
| `StatCard` | 大きな数値＋ラベルの統計カード | `value`, `label`, `icon`, `tone` |
| `FeatureCard` | アイコン＋タイトル＋説明の小型特徴カード | `icon`, `title`, `body` |
| `InfoCard` | アイコン＋タイトル＋説明の情報カード（「食品ロス削減につながる理由」等） | `icon`, `title`, `body`, `tone` |
| `IconList` | アイコン付き箇条書きリスト | `items`, `defaultIcon` |
| `ImageWithFallback` | 画像読み込み失敗時にCSSグラデーション＋絵文字へ自動フォールバックする`<img>`ラッパー | `src`, `alt`, `emoji` |
| `CtaBanner` | リッチなCTAバナー。`imageContainsText`をtrueにすると、写真自体に見出し・CTAがデザイン済みの前提でテキストを重ねず写真全体をクリック領域にする | `title`, `body`, `features`, `ctaLabel`, `onCtaClick`, `image`, `size`, `imageContainsText` |
| `Modal` | 中央配置モーダルの共通ラッパー（オーバーレイクリック・Escで閉じる、閉じるボタン内蔵） | `onClose`, `ariaLabel` |

## Header（`client/src/components/Header.tsx`）

- **用途**: 全画面共通のブランドヘッダー（白背景・高さ72px・sticky）。左側にロゴ＋「Sustainable Recipe Maker」、
  右側に食品ロス特設ページへの導線ボタン（`FoodLossButton`）を常時表示
- **Props**: `{ onLogoClick: () => void; onFoodLossClick: () => void }`
- **利用画面**: 全画面
- **備考**: ロゴクリックで`onLogoClick`を呼び出し、`App.tsx`の`handleGoHome`経由で入力画面に戻る

## FoodLossIcon / FoodLossButton（`client/src/components/FoodLossIcon.tsx` / `FoodLossButton.tsx`）

- **用途**: ヘッダー右側の導線ボタン（アイコン🌱＋ラベル「食品ロスを減らそう」）。アイコン単体・ラベル省略は不可
- **Props**: `FoodLossButton`: `{ icon: string; label: string; onClick: () => void }`
- **利用画面**: `Header`（全画面）

## Hero（`client/src/components/Hero.tsx`）

- **用途**: 入力画面のみに表示するヒーローセクション。背景写真＋半透明オーバーレイ＋見出し
  「今日の夕飯、もう迷わない」＋サブテキスト。`.app`の外側で画面横幅いっぱいに表示
- **Props**: なし
- **利用画面**: 画面①（`view === "input"`）のみ
- **画像**: `client/public/assets/images/hero.png`

## FoodLossHero（`client/src/components/FoodLossHero.tsx`）

- **用途**: 食品ロス特集ページのヒーロー写真。`Hero`と同じ構造で`.app`の外側に配置し、画面横幅いっぱいに表示する。
  写真自体に見出し・統計がデザインされているため、テキストは重ねずトリミングもしない（`height: auto`）
- **Props**: なし
- **利用画面**: `view === "food-loss"` のときのみ
- **画像**: `client/public/assets/images/foodloss-hero.png`（`IMAGE_ASSETS.foodLossHero`）

## FoodLossBanner（`client/src/components/FoodLossBanner.tsx`）

- **用途**: トップページ・ヒーロー直下に表示する、食品ロス特設ページへの導線バナー。
  写真（`foodloss-banner.png`）自体にSPECIALバッジ・タイトル・特徴・CTAボタンがデザイン済みのため、
  `CtaBanner`を`imageContainsText`モードで使用し、テキストを重ねず写真全体をクリック領域にする
- **Props**: `{ onCtaClick: () => void }`
- **利用画面**: 画面①（`view === "input"`。`.app`内、`IngredientInput`の直前に配置）

## RecipeFooterBanner（`client/src/components/RecipeFooterBanner.tsx`）

- **用途**: レシピ詳細ページ最下部に表示する、食品ロス特設ページへの導線バナー。専用の写真アセットが
  まだ無いため、`CtaBanner`の通常モード（テキスト＋CTAボタンを重ねて表示、size="compact"）を使用
- **Props**: `{ onCtaClick: () => void }`
- **利用画面**: 画面③（`RecipeDetailView`の内部末尾に配置）

## IngredientInput（`client/src/components/IngredientInput.tsx`）

- **用途**: 画面①（食材・ジャンル・人数の入力フォーム）。全体を白カードでラップし、
  タイトル「冷蔵庫にある食材を入力してください」を表示（入力ロジック自体は無変更）
- **Props**: `{ loading: boolean; onSubmit: (ingredients: string[], cuisine: Cuisine, servings: number) => void }`
- **利用画面**: 画面①（`view === "input"`）
- **内部state**: 選択中食材（`Set<string>`。定番+自由入力+写真検出をすべて同じSetで管理）、自由入力テキスト、
  ジャンル、人数入力文字列
- **子コンポーネント**: `CommonIngredients`, `PhotoUpload`
- **バリデーション**: 人数が1〜99の整数でない場合は送信ボタンを無効化しつつ案内文を表示。食材が0件でも無効化

## CommonIngredients（`client/src/components/CommonIngredients.tsx`）

- **用途**: 定番食材（卵・乳製品/主食/野菜/肉・魚の4カテゴリ、計26種）のチェックボックス一覧を表示。
  各食材名の先頭に絵文字アイコンを付与（`INGREDIENT_ICONS`対応表、一致しない食材はアイコンなし）
- **Props**: `{ selected: Set<string>; onToggle: (name: string) => void }`
- **利用画面**: 画面①（`IngredientInput` の子として）
- **データソース**: `client/src/commonIngredients.ts` の `COMMON_INGREDIENTS`

## PhotoUpload（`client/src/components/PhotoUpload.tsx`）

- **用途**: 写真を選択し、`/api/detect-ingredients` で食材を自動認識してテキストで結果を表示
- **Props**: `{ onDetected: (ingredients: string[]) => void }`
- **利用画面**: 画面①（`IngredientInput` の子として）
- **内部state**: `loading`, `error`, `preview`（data URL）, `lastDetected`
- **備考**: 同じファイルを連続選択できるよう、処理完了後に `input.value` をリセット

## RecipeList（`client/src/components/RecipeList.tsx`）+ RecipeCard（`client/src/components/RecipeCard.tsx`）

- **用途**: 画面②（提案されたレシピの写真主役ギャラリー）。上部に「使える食材」「おすすめレシピ件数」の
  統計カードを表示し、各レシピは`RecipeCard`（新規抽出コンポーネント）で描画する
- **Props**: `RecipeList`: `{ recipes: Recipe[]; onSelect: (recipe: Recipe) => void }` /
  `RecipeCard`: `{ recipe: Recipe; isAiPick: boolean; onSelect: (recipe: Recipe) => void }`
- **利用画面**: 画面②（`view === "list"`）
- **表示項目**: 写真（ホバーでズーム＋CTAオーバーレイ）、AIおすすめバッジ（既存の`usedCount`が最大の1件にのみ
  付与。新規データ取得なし）、カテゴリ表示（タイトルからのヒューリスティック推定。表示専用でレシピ選定には
  無関係）、調理時間/費用、使える食材・不足食材バッジ
- **関連ユーティリティ**: `client/src/utils/recipeDisplayMeta.ts`（`guessCategoryLabel`, `pickAiRecommendedId`）

## RecipeDetailView（`client/src/components/RecipeDetail.tsx`）

- **用途**: 画面③（レシピ詳細）。写真をヒーロー化し人数/時間/予算を写真上に重ね表示、材料は
  持っている（緑）/不足（赤）で色分け、買い物リストにチェックUI、関連レシピ（既存の検索結果から3件、
  新規API呼び出しなし）、PDF表示/LINE共有/楽天レシピを同格の3ボタンで表示。最下部に`RecipeFooterBanner`
- **Props**: `{ detail: Recipe; servings: number; have: string[]; relatedRecipes: Recipe[]; onBack: () => void; onSelectRelated: (recipe: Recipe) => void; onFoodLossClick: () => void }`
- **利用画面**: 画面③（`view === "detail"`）
- **内部state**: `ingredients`, `steps`, `loading`, `error`, `checkedShopping`（買い物リストのチェック状態。
  セッション内のみ、永続化なし）
- **PDF/共有機能**: 既存仕様のまま変更なし（`html2pdf.js`動的import、Web Share APIフォールバック）

## FoodLossPage（`client/src/components/FoodLossPage.tsx`）＋ `food-loss/` サブコンポーネント

食品ロス特集ページ（`/food-loss`）。楽天市場APIから取得した「ふるさと納税・訳あり商品」を紹介し、
楽天市場への遷移を促すLP。ヒーロー写真は`FoodLossHero`（App.tsx側で全幅描画）が担当し、本コンポーネントは
以下の4セクション＋アクセシビリティ用の非表示h1を並べるだけの薄いラッパー。

| コンポーネント | 用途 |
|---|---|
| `ProblemSection` | 「食品ロスってどんな問題？」。統計カード（`StatCard`）、家庭/企業の内訳 |
| `AppValueSection` | 「今ある食材をムダなく使おう」。冷蔵庫→レシピの導線図解 |
| `ProductSection` | 「食品ロスを減らす商品を探す」。`ProductFilter`（食品種類/地域/金額の絞り込み）＋
  `ProductCard`一覧（`useFoodLossProducts`フックが`services/foodLossProductService.ts`経由で
  `GET /api/food-loss-products`を呼び出す）＋クリックで`ProductModal`表示 |
| `ClosingSection` | 締めのメッセージ＋商品一覧（`#fl-products`）へ戻るCTAボタン |

- **ProductCard**（`components/food-loss/ProductCard.tsx`）: 商品写真・ルールベースバッジ
  （`utils/productBadges.ts`。規格外/数量限定/人気/産地直送等、商品名・説明文のキーワードから導出）・
  商品名（`utils/productNameFormatter.ts`で整形、2行クランプ）・自治体名を表示
- **ProductModal**（`components/food-loss/ProductModal.tsx`）: 画像・バッジ・基本情報・
  「✨ おすすめポイント」（旧「AI分析」表記から改称）・「🌱 食品ロス削減につながる理由」（`InfoCard`3枚）・
  「🍽️ おすすめの食べ方」（`utils/productSuggestions.ts`。foodType別の一般的な食べ方、商品固有データではない）・
  CTA階層（「楽天市場で詳しく見る」が主CTA、「あとで見る」（セッション内のみのトグル、永続化なし）/
  「閉じる」は同格の副CTA）
- **商品名整形ロジック**: `utils/productNameFormatter.ts` が `services/dictionaryService.ts` 経由で
  `data/food-dictionary/*.json`（`scripts/generateFoodDictionary.ts` で楽天市場APIから自動生成した辞書）を
  参照する。詳細は [api.md](./api.md) 参照

## Footer / PolicyPage / PrivacyPolicy 等 / ContactPage

- 変更なし。詳細は既存の説明の通り

## コンポーネント間の関係図

```
App
├── Header (全画面共通)
│   └── FoodLossButton
│       └── FoodLossIcon
├── Hero (画面①のみ)
├── FoodLossHero (food-lossページのみ、.appの外側)
├── FoodLossBanner (画面①のみ、CtaBanner imageContainsTextモード)
├── IngredientInput (画面①)
│   ├── CommonIngredients
│   └── PhotoUpload
├── RecipeList (画面②)
│   └── RecipeCard (×件数分)
├── RecipeDetailView (画面③)
│   └── RecipeFooterBanner (CtaBanner 通常モード)
├── PrivacyPolicy / TermsOfService / AiPolicy / CopyrightPolicy / ContactPage (画面④〜⑧)
│   └── PolicyPage (共通レイアウト)
├── FoodLossPage (/food-loss)
│   ├── ProblemSection (StatCard等)
│   ├── AppValueSection
│   ├── ProductSection
│   │   ├── ProductFilter
│   │   ├── ProductCard (×件数分、Badge使用)
│   │   └── ProductModal (選択時、Modal/InfoCard/Button使用)
│   └── ClosingSection (Button使用)
└── Footer (全画面共通)

common/ (Button, Card, Badge, SectionHeader, StatCard, FeatureCard, InfoCard,
         IconList, ImageWithFallback, CtaBanner, Modal)
  → 上記の各画面から横断的にimportされる共通部品（Context等の暗黙依存はなし）
```

いずれのコンポーネントも他のコンポーネントを跨いだ暗黙の依存（Context経由の共有等）は持たず、
すべて `App.tsx` を介したprops経由のデータフローになっている。
