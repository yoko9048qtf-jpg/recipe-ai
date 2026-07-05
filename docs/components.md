# components.md

全コンポーネントは `client/src/` 配下。すべて関数コンポーネント + 名前付きProps interfaceの構成で統一されている。
状態管理ライブラリは使用せず、親から渡されるコールバック props で子→親のデータの流れを表現する。

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
- **レイアウト**: ルート要素はFragment。`Header`は全画面で常時表示。`Hero`は`view === "input"`のときのみ、
  `.app`の外側（全幅・edge-to-edge）に表示する。`FoodLossBanner`も`view === "input"`のときのみ表示するが、
  こちらは`.app`（max-width 720px）の内側、`IngredientInput`の直前に配置し、Heroより明確に弱い
  「カード」として視覚的に分離する（UIレイヤー設計。[decision-log.md](./decision-log.md)参照）
- **`handleFoodLossClick`**: 食品ロス特設ページへの導線（ヘッダー/トップページバナー/レシピ詳細ページ下部
  バナーで共通の遷移関数）。特設ページ未実装の間は`navigate("food-loss")`によるダミー遷移（Coming Soon表示）。
  将来、外部の特集ページ等に差し替える場合はこの関数の中身を変えるだけでよい

## Footer（`client/src/components/Footer.tsx`）

- **用途**: 全画面共通のフッター。プライバシーポリシー等5つのポリシーページへのリンク、外部サービスの
  クレジット表記（楽天レシピ・Anthropic Claude）、コピーライトを表示
- **Props**: `{ onNavigate: (view: PolicyView) => void }`
- **利用画面**: 全画面
- **備考**: リンクは実際の`<a href>`（`POLICY_PATHS`参照）。左クリックのみ`preventDefault`してSPA内遷移に
  差し替え、中クリック/Ctrl+クリック等は標準のブラウザ動作（新規タブ等）に委ねる

## PolicyPage（`client/src/components/PolicyPage.tsx`）

- **用途**: 5つの静的ポリシーページ共通のレイアウト。タイトル（h1）・最終更新日・「トップに戻る」リンク・
  本文領域を提供する
- **Props**: `{ title: string; lastUpdated: string; onBack: () => void; children: ReactNode }`
- **利用画面**: `PrivacyPolicy`, `TermsOfService`, `AiPolicy`, `CopyrightPolicy`, `ContactPage` から共通利用
- **見出し構成**: ページ全体でh1（タイトル）→ 本文中の各セクションはh2、で統一

## PrivacyPolicy / TermsOfService / AiPolicy / CopyrightPolicy（`client/src/components/*.tsx`）

- **用途**: それぞれプライバシーポリシー・利用規約・AI利用に関する注意事項・著作権/引用ポリシーの本文
- **Props**: `{ onBack: () => void }`
- **利用画面**: `/privacy`, `/terms`, `/ai-policy`, `/copyright`
- **内容の要点**: [requirements.md](./requirements.md) 5節・[decision-log.md](./decision-log.md) 参照

## ContactPage（`client/src/components/ContactPage.tsx`）

- **用途**: お問い合わせ内容の案内とGoogle Formsへの導線。メールアドレスは表示しない
- **Props**: `{ onBack: () => void }`
- **利用画面**: `/contact`
- **備考**: フォームURLは `client/src/constants.ts` の `GOOGLE_FORM_URL`（本番用URLに設定済み）を
  `target="_blank" rel="noreferrer"` のボタンリンクとして表示

## Header（`client/src/components/Header.tsx`）

- **用途**: 全画面共通のブランドヘッダー（白背景・高さ72px・sticky）。左側にロゴ＋「Sustainable Recipe Maker」、
  右側に食品ロス特設ページへの導線ボタン（`FoodLossButton`）を常時表示
- **Props**: `{ onLogoClick: () => void; onFoodLossClick: () => void }`
- **利用画面**: 全画面
- **備考**: ロゴクリックで`onLogoClick`を呼び出し、`App.tsx`の`handleGoHome`経由で入力画面に戻る
  （旧`.app-title-btn`と同等の「ロゴクリックでホーム復帰」機能を引き継ぐ）

## FoodLossIcon（`client/src/components/FoodLossIcon.tsx`）

- **用途**: 食品ロス導線で使うアイコン（現在は絵文字「🌱」）。差し替え可能にするための最小のラッパー
- **Props**: `{ icon?: string; className?: string }`（`icon`省略時は`constants.ts`の`FOOD_LOSS_ICON`）
- **利用画面**: `FoodLossButton`, `FoodLossPage`
- **備考**: 将来、絵文字から画像/SVGアイコンに差し替える場合はこのコンポーネントの実装のみ変更すればよい

## FoodLossButton（`client/src/components/FoodLossButton.tsx`）

- **用途**: ヘッダー右側に常時表示する、食品ロス特設ページへの導線ボタン（ミニマルなアウトラインボタン）。
  「アイコン＋ラベル」のセット表示が必須で、アイコン単体・ラベル省略は不可
- **Props**: `{ icon: string; label: string; onClick: () => void }`（`icon`/`label`は必須。呼び出し側の
  `Header.tsx`が`constants.ts`の`FOOD_LOSS_ICON`/`FOOD_LOSS_HEADER_LABEL`を渡す）
- **利用画面**: `Header`（全画面）
- **備考**: 640px以下でもラベルは省略せず、パディング・フォントサイズを縮小するのみ

## BackgroundImage（`client/src/components/BackgroundImage.tsx`）

- **用途**: 写真背景＋暗めのオーバーレイの共通構造。`FoodLossBanner`と`RecipeFooterBanner`で共用する
- **Props**: `{ className: string; image?: string; children: ReactNode }`
- **利用画面**: `FoodLossBanner`, `RecipeFooterBanner`
- **備考**: `image`を渡さない場合はCSS側のグリーン系グラデーションを仮背景として表示する（写真アセット未用意の
  ための暫定措置）。実写真が用意でき次第、`client/public/assets/images`に配置し`image` propsでパスを
  渡すだけで差し替えられる

## FoodLossBanner（`client/src/components/FoodLossBanner.tsx`）

- **用途**: トップページ・ヒーロー直下に表示する、食品ロス特設ページへの導線バナー。UIレイヤー設計上
  「Hero(最重要) > FoodLossBanner(第2導線) > RecipeFooterBanner(第3・最も控えめ)」の第2階層に位置づけ、
  Heroとは明確に弱い表現にする
- **Props**: `{ onCtaClick: () => void }`
- **利用画面**: 画面①（`view === "input"`。`.app`内、`IngredientInput`の直前に配置）
- **レイアウト**: Hero（全幅・edge-to-edge）とは異なり、`.app`（max-width 720px）内に収まる角丸カード
  （border-radius 14px・box-shadow・薄い白枠・margin-top/bottomでHeroと視覚的に分離）として表示する
- **文言**: `constants.ts`の`FOOD_LOSS_BANNER_TITLE` / `FOOD_LOSS_BANNER_BODY` / `FOOD_LOSS_BANNER_CTA`

## RecipeFooterBanner（`client/src/components/RecipeFooterBanner.tsx`）

- **用途**: レシピ詳細ページ最下部に表示する、食品ロス特設ページへの導線バナー。UIレイヤー設計上
  3階層の中で最も控えめな第3導線（`FoodLossBanner`よりさらに高さ・余白・フォントサイズを縮小したカード。
  `BackgroundImage`を再利用）
- **Props**: `{ onCtaClick: () => void }`
- **利用画面**: 画面③（`view === "detail"`。`RecipeDetailView`の内部末尾に配置）
- **文言**: `constants.ts`の`FOOD_LOSS_RECIPE_BANNER_TITLE` / `FOOD_LOSS_RECIPE_BANNER_BODY`
  （CTAボタン文言は`FoodLossBanner`と共通の`FOOD_LOSS_BANNER_CTA`を使用し、遷移先も同一）

## FoodLossPage（`client/src/components/FoodLossPage.tsx`）

- **用途**: 食品ロス特設ページ（`/food-loss`）。現時点では未実装のためComing Soon表示のみ
- **Props**: `{ onBack: () => void }`
- **利用画面**: `/food-loss`
- **備考**: 将来、楽天ふるさと納税・食品ロス特集ページ等の実コンテンツに差し替える前提。ルーティング
  （`FOOD_LOSS_PATH`）とこのページ自体は差し替え時まで残す

## Hero（`client/src/components/Hero.tsx`）

- **用途**: 入力画面のみに表示するヒーローセクション。背景写真＋半透明オーバーレイ＋見出し
  「今日の夕飯、もう迷わない」＋サブテキスト
- **Props**: なし
- **利用画面**: 画面①（`view === "input"`）のみ
- **画像**: `client/public/assets/images/hero.png`（差し替え可能。ユーザー提供の写真を使用）

## IngredientInput（`client/src/components/IngredientInput.tsx`）

- **用途**: 画面①（食材・ジャンル・人数の入力フォーム）。全体を白カード（角丸20px・shadow）でラップし、
  タイトル「冷蔵庫にある食材を入力してください」を表示（UI刷新。入力ロジック自体は無変更）
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

## RecipeList（`client/src/components/RecipeList.tsx`）

- **用途**: 画面②（提案されたレシピのカード一覧）。0件時は専用の空メッセージを表示
- **Props**: `{ recipes: Recipe[]; onSelect: (recipe: Recipe) => void }`
- **利用画面**: 画面②（`view === "list"`）
- **表示項目**: 画像、タイトル、使える食材数/不足数バッジ、調理時間、不足材料の先頭5件（超過時は「ほか」表記）

## RecipeDetailView（`client/src/components/RecipeDetail.tsx`）

- **用途**: 画面③（レシピ詳細）。材料・不足材料（買い物リスト）・手順の表示、PDF表示、LINE共有、
  最下部に食品ロス導線バナー（`RecipeFooterBanner`）を表示
- **Props**: `{ detail: Recipe; servings: number; have: string[]; onBack: () => void; onFoodLossClick: () => void }`
- **利用画面**: 画面③（`view === "detail"`）
- **内部state**: `ingredients: DetailIngredient[]`, `steps: string[]`, `loading`, `error`
- **副作用**: マウント時（`detail.id`/`title`/`servings` 変更時）に `fetchRecipeDetail()` を呼び出し。
  アンマウント時に `active` フラグでレース条件を防止
- **PDF機能**: `html2pdf.js` を動的import（初期バンドルを軽くするため）。生成したBlobをオブジェクトURL化して
  新規タブで表示し、60秒後に `URL.revokeObjectURL` で解放
- **共有機能**: Web Share API（`navigator.canShare`/`share`）でPDFファイル共有を試み、非対応環境では
  LINEのテキスト共有URLへフォールバック

## コンポーネント間の関係図

```
App
├── Header (全画面共通)
│   └── FoodLossButton
│       └── FoodLossIcon
├── Hero (画面①のみ)
├── FoodLossBanner (画面①のみ)
│   └── BackgroundImage
├── IngredientInput (画面①)
│   ├── CommonIngredients
│   └── PhotoUpload
├── RecipeList (画面②)
├── RecipeDetailView (画面③)
│   └── RecipeFooterBanner
│       └── BackgroundImage
├── PrivacyPolicy / TermsOfService / AiPolicy / CopyrightPolicy / ContactPage (画面④〜⑧)
│   └── PolicyPage (共通レイアウト)
├── FoodLossPage (/food-loss、Coming Soon)
│   └── FoodLossIcon
└── Footer (全画面共通)
```

いずれのコンポーネントも他のコンポーネントを跨いだ暗黙の依存（Context経由の共有等）は持たず、
すべて `App.tsx` を介したprops経由のデータフローになっている。
