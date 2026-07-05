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

### `GET /api/food-loss-products`

食品ロス特集ページ（`/food-loss`）向けに、ふるさと納税の「訳あり」商品を楽天市場APIから検索する。

**入力 (query string)**

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `kind` | `"food-type" \| "region" \| "price"` | ✅ | 絞り込み軸。不正値は400エラー |
| `foodType` | `"meat" \| "seafood" \| "vegetable" \| "fruit" \| "processed"` | `kind === "food-type"` のとき必須 | |
| `region` | `"hokkaido" \| "tohoku" \| "kanto" \| "chubu" \| "kinki" \| "chugoku-shikoku" \| "kyushu-okinawa"` | `kind === "region"` のとき必須 | |
| `priceRange` | `"under-5000" \| "5001-10000" \| "10001-30000" \| "over-30001"` | `kind === "price"` のとき必須 | |

**出力 (200)**

```jsonc
{
  "products": [
    {
      "id": "string",
      "name": "string (商品名。表示側でformatProductName()により整形)",
      "municipality": "string (自治体名。shopNameからの近似値)",
      "quantity": "string (内容量。商品名から抽出できた場合のみ。空文字あり)",
      "donationAmount": 5000,
      "aiInsight": "string (キーワードベースの固定文言。商品詳細ポップアップの「おすすめポイント」に表示)",
      "foodType": "vegetable",
      "region": "kanto",
      "priceRange": "under-5000",
      "imageUrl": "string (任意)",
      "affiliateUrl": "string (任意。RAKUTEN_AFFILIATE_ID設定時のみ)",
      "itemUrl": "string (任意。affiliateUrl未設定時のフォールバック)"
    }
  ]
}
```

**エラー**

| 状況 | ステータス | body |
|---|---|---|
| `kind`/`foodType`/`region`/`priceRange` の指定が不正 | 400 | `{ error: string }` |
| 楽天APIキー未設定・認証失敗・その他例外 | 500 | `{ error: string }` |

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

### 楽天市場API（`server/rakutenIchiba.js`）

- ベース: `https://openapi.rakuten.co.jp`。認証方式は楽天レシピAPIと同じ（`RAKUTEN_APP_ID`/`RAKUTEN_ACCESS_KEY`/
  `RAKUTEN_REFERER` を流用。追加の環境変数は不要）
- 利用エンドポイント: `GET /ichibams/api/IchibaItem/Search/20260701`（キーワード「ふるさと納税 訳あり」＋
  絞り込み条件に応じたキーワード/価格帯を付与）
- `RAKUTEN_AFFILIATE_ID`（任意）を設定すると、レスポンスに`affiliateUrl`が含まれるようになり、商品詳細
  ポップアップの「楽天市場で詳しく見る」がアフィリエイトURLを使うようになる。未設定でも動作する
  （`itemUrl`にフォールバック）
- 楽天のレスポンスには「自治体名」「内容量」の構造化フィールドが存在しないため、`municipality`は
  `shopName`、`quantity`は商品名からの正規表現抽出（`QUANTITY_PATTERN`）による近似値

## 商品名整形（`client/src/utils/productNameFormatter.ts`）

楽天市場APIの商品名（キャンペーン文言・配送情報等を含む長い原文）から、ブランド名・品種名・加工食品名を
優先して簡潔な表示名を生成するロジック。`client/src/services/dictionaryService.ts` が起動時に一度だけ
`client/src/data/food-dictionary/*.json`（series/brands/varieties/compound-foods/processed-foods/
ingredients の6カテゴリ）を読み込み、メモリ上に保持する。

辞書は手入力ではなく `scripts/generateFoodDictionary.ts` が楽天市場APIの実データから自動生成したもので、
再実行すると最新のデータで辞書を作り直せる（`node --env-file=server/.env scripts/generateFoodDictionary.ts`）。
生成ロジックの詳細（抽出・分類・重複除去・既知の限界）は `client/src/services/dictionaryGeneratorService.ts`
のコメントを参照。未分類の商品は `logs/unknown-food-names.json` に出力される。
