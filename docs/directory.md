# directory.md

> `node_modules` / `dist` / ビルドキャッシュ等は省略しています。2026-07-04時点の実ファイルを基に作成。

```
fridge-recipe-app/
├── api/
│   └── index.js              # Vercel サーバーレス関数のエントリポイント。server/app.js を再エクスポートするのみ（ロジックなし）
│
├── client/                   # フロントエンド（React + TypeScript + Vite）
│   ├── index.html            # Vite のHTMLエントリ。PWA用meta/manifestリンクを含む
│   ├── vite.config.ts        # devサーバー設定。/api を localhost:8787 へプロキシ
│   ├── tsconfig.json          # アプリ本体（src）用 tsconfig。strict: true
│   ├── tsconfig.node.json      # vite.config.ts 用の tsconfig（Node環境向け）
│   ├── package.json
│   ├── public/
│   │   ├── assets/images/     # 差し替え可能な画像アセット（UI用。ユーザー提供画像を配置）
│   │   │   ├── hero.png       # ヒーロー背景写真
│   │   │   └── icon.png       # ブランドロゴ原本（ヘッダー表示用。実寸のまま使用）
│   │   ├── icons/              # PWA/favicon/Apple Touch Icon用に icon.png から生成した各サイズのPNG
│   │   │   ├── icon-192.png     # PWAマニフェスト・favicon用（192x192）
│   │   │   ├── icon-512.png     # PWAマニフェスト・favicon用（512x512）
│   │   │   └── apple-touch-icon.png  # iOSホーム画面追加用（180x180）
│   │   ├── manifest.webmanifest  # PWAマニフェスト
│   │   └── sw.js                 # Service Worker（ネットワーク優先＋簡易オフラインキャッシュ、/api配下は対象外）
│   ├── dist/                  # ビルド成果物（.gitignore対象。`npm run build` で生成）
│   └── src/
│       ├── main.tsx           # Reactエントリ。StrictModeでApp をマウントし、Service Workerを登録
│       ├── App.tsx            # 唯一の状態保持コンポーネント。画面遷移(view)・検索条件・選択中レシピを管理
│       ├── api.ts             # バックエンドAPI呼び出し（fetch）をまとめたモジュール
│       ├── types.ts           # 型定義（Cuisine, Recipe, RecipesResponse, DetailIngredient, RecipeDetailData, PolicyView, SpecialView）とCUISINE_OPTIONS
│       ├── constants.ts       # サービス名・Google FormsのURL・ポリシーページのパス/ラベル対応表・食品ロス導線の文言/パス
│       ├── commonIngredients.ts # チェックボックス表示用の定番食材リスト・初期選択食材
│       ├── index.css          # アプリ全体のスタイル（CSS変数によるテーマ管理、Tailwind等は未使用）
│       ├── vite-env.d.ts      # Vite クライアント型参照
│       ├── utils/
│       │   └── recipeHistory.ts # 直近表示レシピIDのlocalStorage永続化ユーティリティ（最大10件・重複排除）
│       └── components/
│           ├── Header.tsx            # 全画面共通ヘッダー（ロゴ＋ブランド名＋食品ロス導線ボタン）
│           ├── Hero.tsx              # 入力画面のみのヒーロー（背景写真＋見出し）
│           ├── FoodLossBanner.tsx    # 入力画面のみ、ヒーロー直下の食品ロス導線バナー
│           ├── RecipeFooterBanner.tsx # レシピ詳細ページ最下部の食品ロス導線バナー（縮小版）
│           ├── BackgroundImage.tsx   # 写真背景＋オーバーレイの共通構造（上記2バナーで共用）
│           ├── FoodLossButton.tsx    # ヘッダー右側の食品ロス導線ボタン
│           ├── FoodLossIcon.tsx      # 食品ロス導線で使うアイコン（差し替え可能なラッパー）
│           ├── FoodLossPage.tsx      # 食品ロス特集（画面⑨, /food-loss。未実装のためComing Soon表示）
│           ├── Footer.tsx            # 全画面共通フッター（ポリシーページへのリンク・外部サービスのクレジット表記）
│           ├── IngredientInput.tsx   # 食材/ジャンル/人数の入力フォーム（画面①、カード化済み）
│           ├── CommonIngredients.tsx # 定番食材チェックボックス群（カテゴリ別、アイコン付き）
│           ├── PhotoUpload.tsx       # 写真アップロード→食材自動認識
│           ├── RecipeList.tsx        # レシピ一覧カード表示（画面②）
│           ├── RecipeDetail.tsx      # レシピ詳細・材料/手順表示・PDF/LINE共有（画面③）
│           ├── PolicyPage.tsx        # 静的ポリシーページ共通レイアウト（タイトル/最終更新日/本文）
│           ├── PrivacyPolicy.tsx     # プライバシーポリシー（画面④, /privacy）
│           ├── TermsOfService.tsx    # 利用規約（画面⑤, /terms）
│           ├── AiPolicy.tsx          # AI利用に関する注意事項（画面⑥, /ai-policy）
│           ├── CopyrightPolicy.tsx   # 著作権・引用ポリシー（画面⑦, /copyright）
│           └── ContactPage.tsx       # お問い合わせ（画面⑧, /contact。Google Formsへの導線）
│
├── server/                    # バックエンド（Express、素のESM JavaScript）
│   ├── index.js               # ローカル開発専用エントリ。dotenv読込＋app.listen(8787)
│   ├── app.js                 # Expressアプリ本体。全APIルート定義・スコアリング/カテゴリ補正/履歴除外/シャッフルロジック
│   ├── rakuten.js             # 楽天レシピAPI連携（カテゴリ一覧・カテゴリ別ランキング取得、プロセス内キャッシュ）
│   ├── vision.js              # Claude Vision連携（写真→食材抽出）
│   ├── steps.js               # Claude連携（レシピ名・材料・人数→材料分量＋手順生成）
│   ├── utils/
│   │   └── shuffle.js         # Fisher-Yates Shuffle の汎用実装（他ロジックへの影響を避けるため切り出し）
│   ├── package.json
│   ├── .env                   # 実際のAPIキー（.gitignore対象、リポジトリには含まれない想定）
│   └── .env.example           # ローカル開発用の環境変数テンプレート
│
├── docs/                      # 本ドキュメント群（本タスクで作成）
│   ├── architecture.md
│   ├── requirements.md
│   ├── directory.md
│   ├── database.md
│   ├── api.md
│   ├── components.md
│   ├── coding-rules.md
│   ├── deployment.md
│   ├── todo.md
│   ├── changelog.md            # リリースノート（Added/Changed/Fixed/Removed、バージョン・コミット対応）
│   ├── decision-log.md         # 設計判断の記録（背景・採用理由・不採用案・影響範囲）
│   ├── development-history.md  # タスク単位の開発履歴（日付・バージョン・コミットメッセージ・ステータス）
│   └── version.md              # 現在のバージョンとバージョン履歴（SemVer）
│
├── run-client.cmd             # Windows向け: clientのみ起動
├── run-server.cmd             # Windows向け: serverのみ起動
├── run-dev.cmd                # Windows向け: npm run dev（client+server同時起動）
├── start-app.cmd              # Windows向け: run-dev.cmd起動→起動待機→ブラウザ自動オープン
├── vercel.json                 # Vercelのビルド・ルーティング設定
├── .env.example                 # ルート用（`vercel dev` 実行時に読まれる）環境変数テンプレート
├── .gitignore
├── package.json                 # ルート。concurrently で client/server を同時起動するスクリプト群
├── README.md
└── 冷蔵庫レシピ提案アプリ.lnk    # デスクトップショートカット（アプリ本体とは無関係）
```

## ディレクトリ設計の要点

- **`api/` と `server/` の分離**: 実際のロジックはすべて `server/app.js` にあり、`api/index.js` は
  Vercel向けの薄いラッパーに過ぎない。これにより「ローカルではExpressサーバーとして常駐、本番では
  サーバーレス関数として呼び出される」という実行モデルの違いを吸収しつつ、ルーティング定義の二重管理を回避している。
- **`client/` はフロントエンドで完結**: サーバーの型定義を共有する仕組み（monorepoの共通パッケージ等）は無く、
  `client/src/types.ts` にフロントエンド用の型が独自定義されている（サーバーはJSDocコメントのみ）。
- **`server/utils/` と `client/src/utils/`**: 現状ユーティリティはそれぞれ1ファイルのみ
  （`shuffle.js` と `recipeHistory.ts`）。責務ごとに小さく切り出す方針が伺える。
