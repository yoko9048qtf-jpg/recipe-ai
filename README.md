# AI×レシピメーカー

冷蔵庫にある食材と気分（和食・洋食・中華・イタリアン）を選ぶと、おすすめレシピを10件提案し、選んだレシピの「必要な材料（指定人数分）」と「不足している材料（買い物リスト）」を表示する Web アプリです。

- 食材の入力: 定番食材のチェック／自由入力／写真アップロード（AIが食材を自動認識）
- レシピ提案: 楽天レシピAPI の人気ランキングから、手持ちの食材とジャンルに合うものを優先して10件提案
- レシピ詳細: AIが指定人数分の材料（具体的な分量）と作り方をその場で生成
- 出力: 詳細画面をPDFでブラウザ表示、LINEで共有
- PWA対応（スマートフォンのホーム画面に追加してアプリのように利用可能）

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React + TypeScript + Vite |
| バックエンド | Express（ローカル開発） / Vercel Serverless Functions（本番） |
| レシピデータ | [楽天レシピAPI](https://webservice.rakuten.co.jp/)（人気ランキング） |
| AI | [Anthropic Claude API](https://console.anthropic.com/)（写真の食材認識・レシピ詳細生成） |

## ディレクトリ構成

```
fridge-recipe-app/
├── api/            # Vercel サーバーレス関数のエントリポイント（本番用）
├── client/         # React + Vite + TypeScript（フロントエンド）
├── server/         # Express アプリ本体（app.js）とローカル起動用エントリ（index.js）
├── vercel.json     # Vercel のビルド・ルーティング設定
└── run-*.cmd 等     # Windows向けの起動ランチャー（任意）
```

`server/app.js` が Express アプリ本体（ルート定義）です。ローカル開発では `server/index.js` がこれを読み込んで `app.listen()` します。Vercel 上では `api/index.js` が同じ `server/app.js` を読み込み、サーバーレス関数としてリクエストごとに呼び出します（`app.listen()` は呼びません）。ルート定義は1箇所にしかないため、ローカルと本番で挙動がずれません。

## セットアップ（ローカル開発）

### 1. 必要な環境

- Node.js 18 以上

### 2. APIキーの取得

- **楽天ウェブサービス**: https://webservice.rakuten.co.jp/ でアプリを登録し、**アプリID（applicationId, UUID形式）** と **アクセスキー（accessKey, `pk_`から始まる形式）** を取得
  - アプリ管理画面の「**有効なWebサイト/IPリスト**」に、実際にアクセスするドメイン（例: `example.com`）を登録してください。サーバーはこのドメインに一致する `Referer`/`Origin` ヘッダーを送信します。
- **Anthropic (Claude)**: https://console.anthropic.com で API キーを取得（写真からの食材認識・レシピ詳細生成に使用）

### 3. 環境変数の設定

`server/.env.example` を `server/.env` にコピーしてキーを設定します。

```bash
cp server/.env.example server/.env
```

| 変数名 | 必須 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude API キー |
| `RAKUTEN_APP_ID` | ✅ | 楽天ウェブサービスのアプリID（UUID形式） |
| `RAKUTEN_ACCESS_KEY` | ✅ | 楽天ウェブサービスのアクセスキー（`pk_`形式） |
| `RAKUTEN_REFERER` | ✅ | 楽天アプリに登録した許可ドメインに一致するURL（例: `http://example.com/`） |
| `API_PORT` | 任意 | ローカルAPIサーバーのポート（未指定なら8787） |
| `STEPS_MODEL` | 任意 | レシピ手順生成に使うClaudeモデル（未指定なら `claude-opus-4-8`。コストを抑えたい場合は `claude-haiku-4-5` 等） |

**`.env` はGitにコミットしないでください**（`.gitignore` で除外済みです）。

### 4. 依存インストール・起動

```bash
npm run install:all
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8787（フロントエンドから `/api/*` へのプロキシ経由でアクセス）

ブラウザで http://localhost:5173 を開いて使用します。

Windowsでは、`start-app.cmd`（またはデスクトップのショートカット）をダブルクリックすると、サーバー起動からブラウザ表示まで自動で行われます。

## Vercelへのデプロイ

このプロジェクトは Vercel にそのままデプロイできる構成になっています。

### 手順

1. GitHubにこのリポジトリをプッシュする
2. [Vercel](https://vercel.com/) で「Add New Project」からこのリポジトリをインポートする
3. Framework Preset は「Other」のままでOK（`vercel.json` がビルド方法を指定済み）
4. **Environment Variables** に、上記の環境変数（`ANTHROPIC_API_KEY` / `RAKUTEN_APP_ID` / `RAKUTEN_ACCESS_KEY` / `RAKUTEN_REFERER`）を設定する
   - `RAKUTEN_REFERER` は、デプロイ後の本番URL（例: `https://your-app.vercel.app/`）を楽天アプリの「許可Webサイト/IPリスト」に追加し、その値に合わせてください
5. Deploy を実行

`vercel.json` の設定内容:
- `buildCommand`: `client/` と `server/` それぞれの依存をインストールし、フロントエンドをビルド
- `outputDirectory`: `client/dist`（静的ファイルとして配信）
- `rewrites`: `/api/*` へのリクエストをすべて `api/index.js`（サーバーレス関数）に転送

### ローカルで Vercel 環境を再現してテストする（任意）

```bash
npm i -g vercel
cp .env.example .env   # ルート直下に .env を作成しキーを設定（vercel dev が自動で読み込みます）
vercel dev
```

### 既知の制約（本番運用時にご留意ください）

- **サーバーレス関数のタイムアウト**: レシピ詳細のAI生成には数秒〜十数秒かかる場合があります。Vercelの無料(Hobby)プランは関数の実行時間上限が10秒のため、生成が間に合わずタイムアウトする可能性があります。`vercel.json` で `maxDuration: 30` を設定していますが、これはPro以上のプランで有効です。
- **リクエストボディサイズ**: Vercel Serverless Functionsにはプラットフォーム側のペイロードサイズ上限（既定4.5MB程度）があります。非常に大きな写真をアップロードすると、この上限で失敗する場合があります。
- **レシピキャッシュの持続性**: `server/rakuten.js` はカテゴリ・ランキングをプロセス内メモリにキャッシュしますが、サーバーレス関数はリクエストごとに実行環境が使い捨てられる場合があるため、ローカル常駐サーバーほどキャッシュが効きません。楽天APIのレート制限に頻繁に当たる場合は、Vercel KV等の外部キャッシュ導入をご検討ください。

## npm スクリプト（ルート package.json）

| コマンド | 内容 |
|---|---|
| `npm run install:all` | ルート・client・server すべての依存をインストール |
| `npm run dev` | フロントエンド・バックエンドを同時起動（ローカル開発） |
| `npm run build` | フロントエンドを本番ビルド（`client/dist` に出力） |
| `npm run vercel-build` | Vercelのビルドコマンド（依存インストール＋ビルドを一括実行） |

## 免責事項

- レシピデータは楽天レシピAPIの利用規約に従って取得・表示しています。商用利用や大量アクセスを行う場合は、楽天ウェブサービスの利用規約をご確認ください。
- AIが生成する材料の分量・調理手順は参考情報です。正確な作り方は各レシピの楽天ページをご確認ください。
