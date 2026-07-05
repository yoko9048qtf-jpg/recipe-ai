import https from "node:https";

// 楽天市場商品検索API（Ichiba Item Search）。
// 認証方式は rakuten.js（楽天レシピAPI）と同じ openapi.rakuten.co.jp + applicationId/accessKey +
// Referer/Origin ヘッダー。同一の RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_REFERER を流用する。
const HOST = "openapi.rakuten.co.jp";

// TODO(要確認): エンドポイントのバージョン日付は楽天ウェブサービスの管理画面（アプリ設定画面）に
// 表示されるサンプルURLと必ず照合すること。楽天側の仕様変更でパスが変わった場合はここを更新する。
const PATH_BASE = "/ichibams/api/IchibaItem/Search/20260701";

function cfg() {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const referer = process.env.RAKUTEN_REFERER || "http://example.com/";
  if (!appId || !accessKey) {
    throw new Error(
      "RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が設定されていません（server/.env を確認してください）"
    );
  }
  let origin;
  try {
    origin = new URL(referer).origin;
  } catch {
    origin = "http://example.com";
  }
  return { appId, accessKey, referer, origin };
}

function rakutenGet(path) {
  const { referer, origin } = cfg();
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: HOST,
        path,
        headers: { Referer: referer, Origin: origin, Accept: "application/json" },
        timeout: 20000,
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(d);
          } catch {
            /* noop */
          }
          if (res.statusCode === 200 && json) {
            resolve(json);
          } else {
            const msg =
              json?.errors?.errorMessage ||
              json?.error_description ||
              `HTTP ${res.statusCode}`;
            reject(new Error(`楽天市場API エラー (${res.statusCode}): ${msg}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("楽天市場APIタイムアウト")));
  });
}

function authQuery(extra) {
  const { appId, accessKey } = cfg();
  // アフィリエイトID（任意）。設定されていれば、レスポンスにaffiliateUrlが含まれるようになる。
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const p = new URLSearchParams({
    applicationId: appId,
    accessKey,
    formatVersion: "2",
    ...(affiliateId ? { affiliateId } : {}),
    ...extra,
  });
  return p.toString();
}

// フィルター種別ごとの検索キーワード。
// 「ふるさと納税」ジャンルの正確な genreId は未確認のため、キーワード検索のみで実装している
// （誤ったgenreIdを固定すると検索漏れの原因になり、キーワードのみのほうが堅牢なため。
// 正確なgenreIdが確認できた場合は、下記 searchFoodLossProducts の query に genreId を追加するとよい）。
const FOOD_TYPE_KEYWORDS = {
  meat: "肉",
  seafood: "海鮮",
  vegetable: "野菜",
  fruit: "果物",
  processed: "加工食品",
};
const REGION_KEYWORDS = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  "chugoku-shikoku": "中国 四国",
  "kyushu-okinawa": "九州 沖縄",
};
const PRICE_RANGE_PARAMS = {
  "under-5000": { maxPrice: 5000 },
  "5001-10000": { minPrice: 5001, maxPrice: 10000 },
  "10001-30000": { minPrice: 10001, maxPrice: 30000 },
  "over-30001": { minPrice: 30001 },
};

/**
 * 食品ロス削減につながる、ふるさと納税の「訳あり」商品を検索する。
 * @param {{kind: "food-type"|"region"|"price", foodType?: string, region?: string, priceRange?: string}} filter
 */
export async function searchFoodLossProducts(filter) {
  const keywordParts = ["ふるさと納税", "訳あり"];
  if (filter.kind === "food-type" && filter.foodType) {
    keywordParts.push(FOOD_TYPE_KEYWORDS[filter.foodType] || "");
  }
  if (filter.kind === "region" && filter.region) {
    keywordParts.push(REGION_KEYWORDS[filter.region] || "");
  }
  const priceParams =
    filter.kind === "price" && filter.priceRange
      ? PRICE_RANGE_PARAMS[filter.priceRange] || {}
      : {};

  const query = authQuery({
    keyword: keywordParts.filter(Boolean).join(" "),
    hits: 20,
    imageFlag: 1,
    availability: 1,
    ...priceParams,
  });

  const data = await rakutenGet(`${PATH_BASE}?${query}`);
  // formatVersion=2でも念のためItems/itemsどちらの形でも受けられるようにしておく
  return data.Items || data.items || [];
}

/** 画像URL配列（文字列 or {imageUrl}オブジェクトのどちらの形式にも対応）から先頭の1件を取り出す */
function pickImageUrl(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return undefined;
  const first = urls[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && typeof first.imageUrl === "string") {
    return first.imageUrl;
  }
  return undefined;
}

// 内容量は構造化フィールドが存在しないため、商品名から重量・個数らしきパターンを抽出する。
// itemCaptionの先頭部分は「よくある質問」等の定型文が来やすく内容量として不適切なため、
// 商品説明文へのフォールバックは行わない（見つからない場合は空文字を返し、表示側で
// 「商品ページをご確認ください」に置き換える）。
const QUANTITY_PATTERN = /[\d０-９]+(?:[.,][\d０-９]+)?\s*(?:kg|g|ｇ|個|本|枚|パック|セット|人前|玉|尾|匹|袋|箱)/;
function inferQuantity(itemName) {
  const fromName = String(itemName || "").match(QUANTITY_PATTERN);
  return fromName ? fromName[0] : "";
}

// 食品ロス削減効果（AI分析）は楽天APIからは取得できないため、商品名・説明文のキーワードから
// 簡易的な固定文言を割り当てる（本物のAI分析ではない旨は運用上の注意点として認識しておくこと）。
function inferAiInsight(itemName, itemCaption) {
  const text = `${itemName || ""} ${itemCaption || ""}`;
  if (/訳あり|規格外/.test(text)) return "規格外品の活用につながります";
  if (/在庫|アウトレット|わけあり/.test(text)) return "余剰在庫の有効活用が期待できます";
  return "地域の食品ロス削減に貢献できます";
}

/**
 * 楽天市場APIの商品1件を、フロントの FoodLossProduct 型に変換する。
 * 楽天のレスポンスには「自治体名」「内容量」という構造化フィールドが存在しないため、
 * 自治体名はshopName（多くのふるさと納税ショップは自治体名を店舗名にしている）で代替する
 * （完全な精度は保証できない近似値）。内容量は商品名から抽出できた場合のみ設定し、
 * 抽出できない場合は空文字を返す（商品説明文へのフォールバックはしない。表示側で
 * 「商品ページをご確認ください」に置き換える。詳細は docs/decision-log.md 参照）。
 */
export function mapRakutenItemToProduct(item, filter) {
  return {
    id: item.itemCode || item.itemUrl || item.itemName,
    name: item.itemName,
    municipality: item.shopName || "自治体情報なし",
    quantity: inferQuantity(item.itemName),
    donationAmount: item.itemPrice,
    aiInsight: inferAiInsight(item.itemName, item.itemCaption),
    foodType: filter.kind === "food-type" ? filter.foodType : "processed",
    region: filter.kind === "region" ? filter.region : "kanto",
    priceRange: filter.kind === "price" ? filter.priceRange : "under-5000",
    imageUrl: pickImageUrl(item.mediumImageUrls) || pickImageUrl(item.smallImageUrls),
    affiliateUrl: item.affiliateUrl,
    itemUrl: item.itemUrl,
  };
}
