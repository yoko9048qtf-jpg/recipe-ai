# deployment.md

## 1. 必要環境変数

### ローカル開発（`npm run dev`）: `server/.env`（`server/.env.example` をコピー）

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude APIキー（写真の食材認識・レシピ詳細生成に使用） |
| `RAKUTEN_APP_ID` | ✅ | 楽天ウェブサービスのアプリID（UUID形式） |
| `RAKUTEN_ACCESS_KEY` | ✅ | 楽天ウェブサービスのアクセスキー（`pk_`形式） |
| `RAKUTEN_REFERER` | ✅ | 楽天アプリに登録した許可ドメインに一致するURL（例: `http://example.com/`） |
| `API_PORT` | 任意 | ローカルAPIサーバーのポート（未指定なら8787。`client/vite.config.ts` のプロキシ先と一致させる） |
| `STEPS_MODEL` | 任意 | レシピ手順生成に使うClaudeモデル（未指定なら `claude-opus-4-8`） |

### ローカルで `vercel dev` を使う場合: ルート直下の `.env`（`.env.example` をコピー）

上記と同じ4つの必須変数（`API_PORT`/`STEPS_MODEL` は同様に任意）。

### 本番（Vercel）

Vercelプロジェクトの **Settings → Environment Variables** に上記必須4変数を設定する。
`RAKUTEN_REFERER` は本番URL（例: `https://your-app.vercel.app/`）を楽天アプリの「許可Webサイト/IPリスト」に
登録した上で、その値に合わせる。

**注意**: `.env` ファイル自体は `.gitignore` で除外されており、リポジトリにコミットしてはならない。

## 2. Build

| コマンド | 実行場所 | 内容 |
|---|---|---|
| `npm run install:all` | ルート | ルート・`client`・`server` すべての依存をインストール |
| `npm run build` | ルート | `client` を本番ビルド（`client/dist` に出力） |
| `npm run vercel-build` | ルート（Vercelが自動実行） | `server`/`client` の依存インストール＋`client`のビルドを一括実行 |

## 3. Deploy

### Vercel（本番運用の想定経路）

1. GitHubリポジトリ（`https://github.com/yoko9048qtf-jpg/recipe-ai`）の `main` ブランチにpush
2. Vercelで「Add New Project」からリポジトリをインポート（GitHub連携済みの場合、`main`へのpushで自動デプロイされる想定）
3. Framework Presetは「Other」のまま（`vercel.json` がビルド方法を指定済み）
4. 環境変数（上記4つ）を設定
5. Deploy実行

`vercel.json` の設定:
- `buildCommand`: `npm run vercel-build`
- `outputDirectory`: `client/dist`（静的ファイルとして配信）
- `rewrites`: `/api/(.*)` → `api/index.js`（サーバーレス関数）にすべて転送
- `functions["api/index.js"].maxDuration`: 30秒（Pro以上のプランでのみ有効。Hobbyプランは10秒上限のため、
  レシピ詳細のAI生成がタイムアウトする可能性がある — README記載の既知の制約）

### ローカルでVercel環境を再現する場合

```bash
npm i -g vercel
cp .env.example .env   # ルート直下に .env を作成しキーを設定
vercel dev
```

### Windows向けローカル起動（開発者の手元PC想定、本番運用ではない）

- `start-app.cmd`: `run-dev.cmd` をバックグラウンドで起動し、`http://localhost:5173` が応答するまで
  ポーリング（最大60回×2秒）してからブラウザを自動で開く
- `run-dev.cmd` / `run-client.cmd` / `run-server.cmd`: それぞれ `npm run dev` 系のショートカット

## 4. Git運用

- リモートリポジトリ: `https://github.com/yoko9048qtf-jpg/recipe-ai.git`（`origin`）。ブランチは `main` のみ運用
  （2026-07-05時点で確認。過去のドキュメント調査時に「`.git`未初期化」と誤って記載していたため訂正済み）
- コミット前に確認すべき除外対象（`.gitignore` に既に設定済み）:
  `node_modules/`, `dist/`, `build/`, `.env`系, `*.tsbuildinfo`, `client/vite.config.js`（誤生成物）,
  `.vercel`, `.claude/`, `*.lnk`, ログファイル, OS/エディタ生成物
- **運用ルール（2026-07-05導入）**: Gitを正式な変更履歴とし、1コミット1目的（Atomic Commit）を徹底する。
  Conventional Commits（`feat:`/`fix:`/`docs:`/`refactor:`/`test:`/`chore:`）でコミットメッセージを統一し、
  コミット前に必ずユーザーへ変更概要・変更ファイル・更新ドキュメント・影響範囲・テスト結果・推奨コミット
  メッセージを報告し、承認後にコミットする（詳細: [docs/development-history.md](./development-history.md)、
  [docs/changelog.md](./changelog.md)、[docs/version.md](./version.md)）
- ブランチ運用（feature branch戦略等）・PRテンプレートは現状未整備（（推測）個人開発規模のため、
  チーム開発へ移行する際に整備が必要）

## 5. デプロイ後に確認すべきこと（README記載の既知の制約）

- サーバーレス関数のタイムアウト（Hobbyプラン10秒 vs レシピ詳細生成に数秒〜十数秒）
- リクエストボディサイズの上限（Vercelプラットフォーム側、既定約4.5MB）。写真アップロードが大きすぎると失敗しうる
- 楽天APIのプロセス内キャッシュ（`server/rakuten.js`）はサーバーレス環境では実行毎にリセットされうるため、
  レート制限に頻繁に当たる場合は外部キャッシュ（Vercel KV等）の導入を検討
