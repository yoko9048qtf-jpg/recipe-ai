# architecture.md

> このドキュメントはコードベース（2026-07-04時点）を正として作成しています。推測を含む箇所は「（推測）」と明記しています。

## 1. システム概要

「AI×レシピメーカー」は、ユーザーが手持ちの食材と気分（和食/洋食/中華/イタリアン）を入力すると、
楽天レシピAPIの人気ランキングから条件に合うレシピを提案し、選んだレシピについて
AI（Anthropic Claude）が指定人数分の材料・手順を生成する Web アプリケーション。

- フロントエンド: React + TypeScript + Vite の SPA（1ページアプリ、クライアントサイドの画面遷移のみ）
- バックエンド: Express アプリ（`server/app.js`）。ローカル開発では `server/index.js` が `app.listen()` し、
  本番（Vercel）では `api/index.js` が同じ `app.js` をサーバーレス関数として呼び出す
- 永続DBは存在しない（[database.md](./database.md) 参照）。状態はすべてリクエスト単位・プロセス内メモリ・
  ブラウザの `localStorage` で完結する

## 2. アーキテクチャ

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│   client (React/Vite)   │  HTTP  │   server/app.js (Express)     │
│  - 画面: 入力/一覧/詳細   │ ─────▶ │  - /api/recipes               │
│  - localStorage 履歴管理  │        │  - /api/recipe-detail          │
└─────────────────────────┘        │  - /api/detect-ingredients     │
                                    │  - /api/health                 │
                                    └───────────┬───────────┬───────┘
                                                │           │
                                   ┌────────────▼───┐   ┌───▼─────────────┐
                                   │ 楽天レシピAPI    │   │ Anthropic Claude │
                                   │ (server/rakuten.js)│ │ (server/steps.js, │
                                   │ カテゴリ別ランキング │ │  server/vision.js)│
                                   └─────────────────┘   └──────────────────┘
```

- ローカル開発: `npm run dev` が `concurrently` で client(Vite, 5173) と server(Express, 8787) を同時起動し、
  Vite の `server.proxy["/api"]` (`client/vite.config.ts`) が API リクエストを 8787 へ転送する
- 本番（Vercel）: `vercel.json` の `rewrites` が `/api/*` を `api/index.js` に転送し、`client/dist` を静的配信する。
  Express アプリ本体は1箇所（`server/app.js`）にしかなく、ローカルと本番でルーティングロジックが分岐しない設計

## 3. データフロー

### 3.1 レシピ提案（`POST /api/recipes`）

```
① ユーザーが食材・気分を選択
② client: fetchRecipes() が localStorage の履歴(recipeHistory)を読み、
   { ingredients, cuisine, history } を送信
③ server:
   a. 気分(cuisine) → カテゴリID群(primary/supplement)にマッピング
   b. 楽天APIから primary → supplement の順にランキング取得（カテゴリ単位で1時間キャッシュ）
   c. recipeId で重複除去
   d. 手持ち食材の一致数でスコアリング（主菜優先 + ジャンル一致ボーナス - 不足材料減点）
   e. カテゴリの偏り補正（補完カテゴリは最大2件、primaryは無制限）
   f. 履歴除外（非履歴レシピ優先、不足時のみ履歴レシピで補充）
   g. Fisher-Yates Shuffle（選定済みの表示順のみランダム化）
   h. 上位 RESULT_COUNT(=10) 件を返却
④ client: 受け取ったレシピ一覧を表示し、表示した recipeId を localStorage に保存（最大10件）
```

### 3.2 レシピ詳細生成（`POST /api/recipe-detail`）

```
① ユーザーが一覧からレシピを選択（このAPI呼び出しは発生しない。楽天ランキング応答にmaterialsを含むため）
② ユーザーが人数を確定 → client: fetchRecipeDetail(title, materials, servings, have)
③ server: Claude に「料理名・参考材料・人数」を渡し、JSON Schema 制約付きで
   { ingredients:[{name,amount}], steps:[string] } を生成させる
④ server: 生成された各材料が手持ち食材/常備調味料に該当するか判定し missing フラグを付与
⑤ client: 材料・手順・不足材料（買い物リスト）を表示。PDF表示・LINE共有はクライアント側で完結
```

### 3.3 写真からの食材認識（`POST /api/detect-ingredients`）

```
① ユーザーが写真を選択 → client がブラウザ内で data URL に変換
② server: Claude Vision に画像を渡し、写っている食材を日本語で列挙させる（JSON Schema制約）
③ client: 抽出結果を「選択済み食材」に追加（重複は自動でマージ）
```

## 4. ディレクトリ責務

詳細は [directory.md](./directory.md) を参照。要点のみ:

| ディレクトリ | 責務 |
|---|---|
| `client/src` | 画面・コンポーネント・API呼び出し・ユーティリティ（フロントエンド全体） |
| `server/` | Express アプリ本体・楽天API連携・Claude連携（ローカル/本番共通のロジック） |
| `api/` | Vercel サーバーレス関数のエントリポイントのみ（ロジックは持たず `server/app.js` を再エクスポート） |
| `docs/` | 本ドキュメント群 |

## 5. コンポーネント責務

詳細は [components.md](./components.md) を参照。`App.tsx` が唯一の状態保持・画面遷移コンポーネントで、
子コンポーネントは props 経由でコールバックを受け取るだけの「表示 + ローカル入力状態」に徹している（Redux等のグローバル状態管理ライブラリは未使用）。

## 6. 状態管理・ルーティング

- グローバル状態管理ライブラリ（Redux/Zustand/Context API等）は使用していない
- 画面遷移・検索条件・選択中レシピは `App.tsx` の `useState` で一元管理し、
  `view: "input" | "list" | "detail" | PolicyView | SpecialView` で単一ページ内の画面切り替えを行う
- **ルーティング（2026-07-05導入）**: React Router 等のライブラリは追加せず、`window.history.pushState` /
  `popstate` を直接使った軽量な自前ルーターを `App.tsx` に実装している
  - `POLICY_PATHS` / `FOOD_LOSS_PATH`（`client/src/constants.ts`）が `view` とURLパス（`/privacy`等）の対応表
  - `navigate(view)` がURLの更新（該当パスがなければ `/`）と `view` state の更新を同時に行う
  - `popstate` イベントで、ブラウザの戻る/進むボタンにもURLと画面を同期させる
  - Footerの各リンクは実際の `<a href>` を持つため、右クリック・中クリック等の標準的なブラウザ操作を
    妨げない（クリックイベントで `preventDefault` してSPA内遷移に差し替える）
  - `入力/一覧/詳細` の3画面は従来どおりURLを持たない内部状態（`/` のまま）で、ポリシーページ・
    食品ロス特設ページ（`/food-loss`）のみが固有のURLを持つ
  - 本番（Vercel）では、直接URL・リロードでもポリシーページが表示できるよう、`vercel.json` に
    `/(.*) → /index.html` のSPAフォールバックを追加している（[deployment.md](./deployment.md) 参照）
  - 食品ロス特設ページへの導線（ヘッダー/①バナー/③バナー）は`handleFoodLossClick`関数に集約しており、
    特設ページを外部URL（楽天ふるさと納税・食品ロス特集ページ等）に差し替える際はこの関数の中身
    （`navigate("food-loss")`）を変更するだけでよい設計にしている
- 入力フォームの状態（選択食材・気分・人数など）は `IngredientInput.tsx` 内のローカル state
- 直近表示レシピ履歴のみ、ブラウザの `localStorage`（キー: `recipeHistory`）に永続化される
  （[client/src/utils/recipeHistory.ts](../client/src/utils/recipeHistory.ts)）

## 7. API構成

詳細は [api.md](./api.md) を参照。全4エンドポイント、すべて `server/app.js` に定義:

- `POST /api/recipes` — レシピ提案
- `POST /api/recipe-detail` — 指定人数分の材料・手順をAI生成
- `POST /api/detect-ingredients` — 写真から食材抽出
- `GET /api/health` — ヘルスチェック（`{ ok: true }` を返すのみ）

## 8. 設計思想（推測含む）

- **ロジックの一元化**: Express アプリ本体を `server/app.js` に集約し、ローカル(`server/index.js`)・
  本番(`api/index.js`)の両エントリポイントから同じものを読み込むことで「ローカルと本番で挙動がずれない」ことを
  明示的に意図している（README に明記あり）
- **軽量バックエンド**: サーバー側はTypeScript化せず、素のESM JavaScript + JSDocコメントで型を補助する方針
  （`tsconfig` は client にのみ存在）
- **外部APIのキャッシュ**: 楽天APIのカテゴリ一覧・ランキングをプロセス内メモリでキャッシュし、レート制限回避と
  レスポンス速度向上を図る（ただしサーバーレス環境では実行毎に消える可能性があるとREADMEに明記— 既知の制約）
- **段階的な体験向上**: スコアリング/主菜優先/カテゴリ補正という「品質を決めるロジック」と、
  履歴除外/シャッフルという「体験の多様性を上げるロジック」を明確に分離し、後者が前者の並び順に影響しないよう
  処理順序（スコアリング→カテゴリ補正→履歴除外→シャッフル→上位N件）を厳密に守っている（（推測）意図的な設計判断）
- **通信回数を増やさない制約**: 履歴情報はAPI呼び出しを増やさず、同一リクエストのボディに `history` として
  同梱する設計になっている（クライアントに認証・セッションがないため、サーバー側に状態を持たせずクライアント主導で完結させている）
