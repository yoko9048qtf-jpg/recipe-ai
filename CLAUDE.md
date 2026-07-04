# CLAUDE.md

このファイルは、Claude Code（またはその他のAIコーディングエージェント）がこのプロジェクトで開発を
継続するためのガイドです。**このファイルだけ読めば開発を再開できる**ことを目標にしています。
より詳細な情報は `docs/` 配下の各ドキュメントを参照してください。

## プロジェクト概要

「AI×レシピメーカー」。冷蔵庫にある食材と気分（和食/洋食/中華/イタリアン）を入力すると、
楽天レシピAPIの人気ランキングから条件に合うレシピを最大10件提案し、選んだレシピについて
AI（Anthropic Claude）が指定人数分の材料（分量つき）と作り方を生成する。不足材料は買い物リストとして表示し、
PDF表示・LINE共有ができる。PWA対応で、スマートフォンのホーム画面に追加してアプリのように使える。
永続データベース・ユーザー認証は存在しない、個人〜家庭利用規模のWebアプリ。

詳細: [docs/requirements.md](docs/requirements.md)

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript(strict) + Vite（プレーンCSS、状態管理ライブラリ・ルーターなし） |
| バックエンド | Express（素のESM JavaScript、TypeScript化していない） |
| 実行環境 | ローカル: Express常駐サーバー / 本番: Vercel Serverless Functions（同じ `server/app.js` を共用） |
| レシピデータ | 楽天レシピAPI（人気ランキング、`server/rakuten.js`） |
| AI | Anthropic Claude API（`@anthropic-ai/sdk`。写真の食材認識・レシピ手順生成） |
| DB | なし。状態はプロセス内メモリキャッシュとブラウザ `localStorage` のみ（[docs/database.md](docs/database.md)） |
| テスト/Lint | 未導入（ESLint/Prettier/テストランナーいずれも設定ファイルなし） |

## ディレクトリ構成（要点）

```
fridge-recipe-app/
├── api/index.js        # Vercel用エントリ（server/app.jsを再エクスポートするだけ）
├── client/src/          # フロントエンド本体
│   ├── App.tsx           # 唯一の状態保持コンポーネント（画面遷移・検索条件を管理）
│   ├── api.ts            # バックエンド呼び出し関数群
│   ├── types.ts          # 型定義
│   ├── components/       # IngredientInput, CommonIngredients, PhotoUpload, RecipeList, RecipeDetail
│   └── utils/recipeHistory.ts  # 表示履歴のlocalStorage永続化
├── server/
│   ├── app.js            # Expressアプリ本体。全APIルート・スコアリング/カテゴリ補正/履歴除外/シャッフル
│   ├── index.js          # ローカル開発用エントリ（app.listen）
│   ├── rakuten.js         # 楽天レシピAPI連携
│   ├── vision.js / steps.js  # Claude連携（食材認識 / レシピ詳細生成）
│   └── utils/shuffle.js   # Fisher-Yates Shuffle
├── docs/                 # 詳細ドキュメント（下記「ドキュメント一覧」参照）
└── vercel.json / .env.example 等  # デプロイ設定
```

詳細・各ファイルの役割: [docs/directory.md](docs/directory.md)

## 設計方針

- **ロジックの一元化**: Expressルート定義は `server/app.js` のみに存在する。ローカル(`server/index.js`)・
  本番(`api/index.js`)はこれを読み込むだけの薄いエントリポイント。**新しいAPIエンドポイントは必ず
  `server/app.js` に追加する**（`api/index.js` を直接編集しない）
- **通信回数を増やさない**: 新機能を追加する際、既存のAPI呼び出し回数を増やさずに実現できないか
  まず検討する（実例: 表示履歴はサーバー状態を持たず、既存の `/api/recipes` リクエストボディに
  `history` として同梱している）
- **処理順序を守る**: `/api/recipes` の処理は
  「重複除去 → スコアリング → 主菜優先 → カテゴリ補正 → 履歴除外 → シャッフル → 上位N件」の順で固定。
  スコアリング/主菜優先/カテゴリ補正は「レシピ提案の品質」を決めるコアロジックであり、
  ユーザー体験上重要なので**明示的な指示がない限り変更しない**。履歴除外・シャッフルは「多様性」を
  担保する後付けの層で、これらは選定結果の順序・件数に影響を与えない範囲で動作する
- **軽量バックエンド**: サーバー側はTypeScript化せず、JSDocコメントで型を補足する。バックエンドに
  ビルドステップを増やさない方針
- **状態はステートレスに保つ**: サーバーにセッション・DBを持たせず、必要な状態はクライアントの
  `localStorage` かリクエストボディで受け渡す

詳細: [docs/architecture.md](docs/architecture.md)

## 開発時の注意事項

- ローカル開発は `npm run dev`（ルート）で client(5173) + server(8787) を同時起動。Viteが `/api` を
  8787へプロキシする（`client/vite.config.ts`）
- `server/.env` にAPIキー（`ANTHROPIC_API_KEY`, `RAKUTEN_APP_ID`, `RAKUTEN_ACCESS_KEY`, `RAKUTEN_REFERER`）が
  必要。`server/.env.example` を参照
- 楽天APIはレート制限（429）に当たりやすい。開発中に短時間で連続リクエストすると失敗することがある
  （バグではなく既知の挙動）
- フロントエンドのビルドは `tsc -b && vite build`。**型エラーが出た状態でコミット/報告しない**
- コンポーネントを追加する際は既存のprops経由データフロー（Context/グローバル状態管理は使わない）に合わせる
- 新しいユーティリティ関数は責務ごとに `client/src/utils/` または `server/utils/` に切り出す
  （既存: `recipeHistory.ts`, `shuffle.js`）
- 変更が画面表示に影響する場合は、実際にブラウザ（プレビュー）で動作確認してから完了報告する

## 禁止事項

- スコアリング・主菜優先・カテゴリ偏り補正のロジックを、明確な指示なく変更・削除しない
  （ユーザー体験の根幹であり、過去の依頼でも「一切変更しないこと」と明示されている）
- 楽天APIのカテゴリ数・APIコール回数を不用意に増やさない（レート制限・Runtimeへの影響を考慮する）
- `.env` ファイルの内容をコミットしない、ログに出力しない
- `api/index.js` にビジネスロジックを直接書かない（`server/app.js` に集約する）
- 未使用の`--no-verify`や型エラーの握りつぶし（`as any`の濫用等）でCIやビルドを通そうとしない
- 明示的な依頼なくDB・認証・状態管理ライブラリなど新しい永続化/依存を追加しない（現状の設計思想が
  「ステートレス・軽量」であるため、追加する場合は事前に方針をすり合わせる）

## 開発・履歴管理ワークフロー（2026-07-05導入）

このプロジェクトでは、コード実装だけでなくドキュメント・バージョン管理も含めて1つの開発フローとして扱う。
**Gitを正式な変更履歴、`docs/`配下を最新仕様とする**。コードとドキュメントは常に同期させ、更新漏れを防ぐこと。

### 実装フロー（毎タスク共通）

① 要件確認 → ② 影響範囲整理 → ③ 実装 → ④ テスト/型チェック/Lint（該当するもの） → ⑤ `docs/`更新 →
⑥ 変更内容の要約 → ⑦ コミット内容の提案 → ⑧ **ユーザー承認後にコミット**

### 変更内容に応じて更新するドキュメント

| 変更内容 | 更新対象 |
|---|---|
| 機能追加・要件変更・制約変更 | [docs/requirements.md](docs/requirements.md) |
| アーキテクチャ・データフロー・状態管理・認証・外部連携の変更 | [docs/architecture.md](docs/architecture.md) |
| API・エンドポイント・レスポンスの変更 | [docs/api.md](docs/api.md) |
| テーブル・カラム・マイグレーション・インデックスの変更 | [docs/database.md](docs/database.md)（現状DB不使用。導入時に更新） |
| コンポーネント追加・Props変更・共通化・削除 | [docs/components.md](docs/components.md) |
| コーディング規約・命名規則・ディレクトリ構成・開発ルールの変更 | [docs/coding-rules.md](docs/coding-rules.md) |
| Build・Deploy・環境変数・CI/CDの変更 | [docs/deployment.md](docs/deployment.md) |
| （毎回） | [docs/todo.md](docs/todo.md) — 未着手/作業中/完了/保留と優先度を更新 |
| （毎回、リリース単位） | [docs/changelog.md](docs/changelog.md) — Added/Changed/Fixed/Removedを記録 |
| （毎回） | [docs/development-history.md](docs/development-history.md) — 日付・バージョン・実施内容・コミットメッセージ・ステータス |
| 設計判断が発生した場合のみ | [docs/decision-log.md](docs/decision-log.md) — 背景・採用理由・不採用案・影響範囲 |
| バージョン変更時 | [docs/version.md](docs/version.md) — SemVer（`fix:`→Patch, `feat:`→Minor, 破壊的変更→Major） |

### コミット前の報告フォーマット（承認を得てからコミットする）

```
【変更概要】
【変更ファイル】
【更新したドキュメント】
【影響範囲】
【テスト結果】
【推奨コミットメッセージ】（Conventional Commits: feat:/fix:/docs:/refactor:/test:/chore:）
```

### タスク完了時の最終確認チェックリスト

- [ ] コードとドキュメントが一致している
- [ ] TODOが更新されている
- [ ] Changelogが更新されている
- [ ] Development Historyが更新されている
- [ ] Versionが更新されている
- [ ] Decision Logが必要なら更新されている
- [ ] コミット内容が整理されている（1コミット1目的）

## よく使うコマンド

```bash
# 初回セットアップ
npm run install:all
cp server/.env.example server/.env   # キーを設定

# ローカル開発（client:5173 + server:8787 同時起動）
npm run dev

# フロントエンドのみ / サーバーのみ
npm run dev:client
npm run dev:server

# 型チェック（client）
cd client && npx tsc -b

# 本番ビルド（client/dist に出力）
npm run build

# Vercel環境をローカル再現
cp .env.example .env
vercel dev
```

## ドキュメント一覧

| ドキュメント | 内容 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | システム概要・アーキテクチャ・データフロー・状態管理 |
| [docs/requirements.md](docs/requirements.md) | アプリ概要・主要機能・画面一覧・業務フロー・制約条件 |
| [docs/directory.md](docs/directory.md) | ディレクトリ構成のツリーと各ファイルの役割 |
| [docs/database.md](docs/database.md) | DB不使用の理由と代替の状態保持の仕組み |
| [docs/api.md](docs/api.md) | 内部API（4エンドポイント）・外部API（楽天/Claude）の仕様 |
| [docs/components.md](docs/components.md) | Reactコンポーネント一覧・Props・利用画面 |
| [docs/coding-rules.md](docs/coding-rules.md) | 命名規則・TSルール・エラーハンドリング・UI方針等 |
| [docs/deployment.md](docs/deployment.md) | 環境変数・ビルド・Vercelデプロイ・Git運用 |
| [docs/todo.md](docs/todo.md) | 実装状況（未着手/作業中/完了/保留）・技術的負債・優先度 |
| [docs/changelog.md](docs/changelog.md) | リリースノート（Added/Changed/Fixed/Removed、バージョン・コミット対応） |
| [docs/decision-log.md](docs/decision-log.md) | 設計判断の記録（背景・採用理由・不採用案・影響範囲） |
| [docs/development-history.md](docs/development-history.md) | タスク単位の開発履歴（日付・バージョン・コミットメッセージ・ステータス） |
| [docs/version.md](docs/version.md) | 現在のバージョンとバージョン履歴（SemVer） |

各ドキュメントは2026-07-04〜05時点のコードベース・git履歴を正として作成されています。コードとの乖離に
気づいた場合はドキュメント側を修正してください（推測で書かれた箇所には「（推測）」と明記されています）。
リモートリポジトリ: `https://github.com/yoko9048qtf-jpg/recipe-ai.git`（`main`ブランチ運用）。
