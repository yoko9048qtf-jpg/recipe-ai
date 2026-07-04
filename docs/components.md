# components.md

全コンポーネントは `client/src/` 配下。すべて関数コンポーネント + 名前付きProps interfaceの構成で統一されている。
状態管理ライブラリは使用せず、親から渡されるコールバック props で子→親のデータの流れを表現する。

## App（`client/src/App.tsx`）

- **用途**: アプリ全体のルート。画面遷移（`view: "input" | "list" | "detail"`）、検索結果、選択中レシピ、
  検索条件（食材・人数）を一元管理する唯一のstateful componentコンポーネント。
- **Props**: なし（ルートコンポーネント）
- **利用画面**: 全画面（`main.tsx` からマウントされる唯一のエントリ）
- **保持するstate**: `view`, `loading`, `error`, `recipes: Recipe[]`, `selected: Recipe | null`,
  `haveIngredients: string[]`, `servings: number`
- **副作用**: 画面遷移毎に `window.scrollTo(top)`。検索成功時に `addRecipesToHistory()` を呼び出し
  localStorageへ表示履歴を保存

## IngredientInput（`client/src/components/IngredientInput.tsx`）

- **用途**: 画面①（食材・ジャンル・人数の入力フォーム）
- **Props**: `{ loading: boolean; onSubmit: (ingredients: string[], cuisine: Cuisine, servings: number) => void }`
- **利用画面**: 画面①（`view === "input"`）
- **内部state**: 選択中食材（`Set<string>`。定番+自由入力+写真検出をすべて同じSetで管理）、自由入力テキスト、
  ジャンル、人数入力文字列
- **子コンポーネント**: `CommonIngredients`, `PhotoUpload`
- **バリデーション**: 人数が1〜99の整数でない場合は送信ボタンを無効化しつつ案内文を表示。食材が0件でも無効化

## CommonIngredients（`client/src/components/CommonIngredients.tsx`）

- **用途**: 定番食材（卵・乳製品/主食/野菜/肉・魚の4カテゴリ）のチェックボックス一覧を表示
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

- **用途**: 画面③（レシピ詳細）。材料・不足材料（買い物リスト）・手順の表示、PDF表示、LINE共有
- **Props**: `{ detail: Recipe; servings: number; have: string[]; onBack: () => void }`
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
├── IngredientInput (画面①)
│   ├── CommonIngredients
│   └── PhotoUpload
├── RecipeList (画面②)
└── RecipeDetailView (画面③)
```

いずれのコンポーネントも他のコンポーネントを跨いだ暗黙の依存（Context経由の共有等）は持たず、
すべて `App.tsx` を介したprops経由のデータフローになっている。
