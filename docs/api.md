# api.md

すべて `server/app.js` に定義された Express ルート。ローカルでは `http://localhost:8787`、
本番では同一オリジンの `/api/*`（Vercel経由）でアクセスする。共通で `express.json({ limit: "12mb" })` を使用。

## 内部API（このアプリが提供するエンドポイント）

### `POST /api/recipes`

冷蔵庫の食材・ジャンルからおすすめレシピを提案する。

**入力 (JSON body)**

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `ingredients` | `string[]` | ✅ | 手持ち食材（日本語）。空配列は400エラー |
| `cuisine` | `"japanese" \| "western" \| "chinese" \| "italian"` | 任意 | 未指定/不正値は `"japanese"` にフォールバック |
| `history` | `(number\|string)[]` | 任意 | 直近表示済みレシピID（クライアントのlocalStorage由来）。除外優先度の判定にのみ使用 |

**出力 (200)**

```jsonc
{
  "recipes": [
    {
      "id": 1234567890,
      "title": "string",
      "image": "string (URL, 空文字あり)",
      "url": "string (楽天レシピの詳細ページURL)",
      "indication": "string (例: 約15分)",
      "cost": "string (例: 300円前後)",
      "materials": ["string", "..."],
      "missingMaterials": ["string", "..."],
      "usedCount": 0,
      "missedCount": 0
    }
  ]
}
```

最大10件（`RESULT_COUNT`）。候補が不足する場合はそれ未満になることがある。

**エラー**

| 状況 | ステータス | body |
|---|---|---|
| `ingredients` が空 | 400 | `{ error: "食材を1つ以上指定してください。" }` |
| 楽天APIキー未設定・認証失敗（primaryカテゴリが全滅） | 500 | `{ error: "楽天レシピAPIにアクセスできません（...）。..." }` |
| その他の例外 | 500 | `{ error: string }` |

補完（supplement）カテゴリの取得失敗は握りつぶされ、primaryカテゴリの結果のみで処理を継続する。

**処理内容の詳細**は [architecture.md](./architecture.md#31-レシピ提案post-apirecipes) を参照。

---

### `POST /api/recipe-detail`

選択したレシピについて、指定人数分の材料（分量つき）と手順をAIで生成する。

**入力 (JSON body)**

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | `string` | ✅ | レシピ名 |
| `materials` | `string[]` | 任意 | 楽天レシピの原文材料（AI生成の参考情報） |
| `have` | `string[]` | 任意 | 手持ち食材（不足判定に使用） |
| `servings` | `number` | ✅ | 人数。1〜99の整数以外は400エラー（**未入力ではレシピを生成しない仕様**） |

**出力 (200)**

```jsonc
{
  "servings": 2,
  "ingredients": [
    { "name": "string", "amount": "string (例: 300g, 大さじ2, 1個)", "missing": false }
  ],
  "steps": ["string", "..."]
}
```

**エラー**

| 状況 | ステータス | body |
|---|---|---|
| `title` 未指定 | 400 | `{ error: "レシピ名が指定されていません。" }` |
| `servings` が整数でない/範囲外 | 400 | `{ error: "何人分の料理を作りますか？人数を1〜99の整数で指定してください。" }` |
| `ANTHROPIC_API_KEY` 未設定 | 500 | `{ error: string }` |
| その他の例外 | 500 | `{ error: string }` |

---

### `POST /api/detect-ingredients`

写真（data URL）から食材を抽出する。

**入力 (JSON body)**

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `image` | `string` | ✅ | `data:image/xxx;base64,...` 形式のdata URL |

**出力 (200)**

```jsonc
{ "ingredients": ["string", "..."] }
```

**エラー**

| 状況 | ステータス | body |
|---|---|---|
| `image` 未指定 | 400 | `{ error: "画像が指定されていません。" }` |
| data URL形式が不正 | 500 | `{ error: "画像データの形式が不正です（data URL を渡してください）" }` |
| `ANTHROPIC_API_KEY` 未設定・その他例外 | 500 | `{ error: string }` |

---

### `GET /api/health`

**出力 (200)**: `{ "ok": true }` 固定。認証等の付随処理なし（死活監視用、（推測））。

---

## 外部API（このアプリが利用する側）

### 楽天レシピAPI（`server/rakuten.js`）

- ベース: `https://openapi.rakuten.co.jp`
- 認証: `applicationId`（UUID）+ `accessKey`（`pk_`形式）をクエリに付与。加えて `Referer`/`Origin` ヘッダーが
  楽天アプリ管理画面に登録した許可ドメインと一致している必要がある（Node標準の `fetch` は `Referer` を
  禁止ヘッダーとして除去するため、`node:https` を直接使用している）
- 利用エンドポイント:
  - `GET /recipems/api/Recipe/CategoryList/20170426?categoryType=large` — 大カテゴリ一覧（プロセス内キャッシュ、TTLなし＝起動中は再取得しない）
  - `GET /recipems/api/Recipe/CategoryRanking/20170426?categoryId={id}` — カテゴリ別人気ランキング（TTL 1時間）
- レート制限対策: 複数カテゴリを取得する `getRankings()` はカテゴリ間に400msの待機を挟み、
  1カテゴリの失敗は警告ログのみでスキップ（全滅時のみ例外を上位に伝播）

### Anthropic Claude API（`server/vision.js`, `server/steps.js`）

- SDK: `@anthropic-ai/sdk`
- `vision.js`: `messages.create()` に画像（base64）+ テキストを渡し、`output_config.format` に
  `json_schema` を指定して `{ ingredients: string[] }` を厳密なJSONで受け取る。モデルは `claude-opus-4-8` 固定
- `steps.js`: 同様に `json_schema` 制約で `{ ingredients, steps }` を生成。モデルは環境変数 `STEPS_MODEL`
  （未設定時は `claude-opus-4-8`）
- どちらもAPIキー未設定時は呼び出し時に初めて例外を投げる遅延初期化（サーバー起動自体はキー無しでも可能）
