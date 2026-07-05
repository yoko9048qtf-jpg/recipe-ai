// 商品名抽出辞書の自動生成スクリプト。
//
// 実行方法:
//   node --env-file=server/.env scripts/generateFoodDictionary.ts
//
// server/.env の RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_REFERER を使って
// 楽天市場API（server/rakutenIchiba.js と同じ認証方式）から実際の商品情報を収集し、
// client/src/services/dictionaryGeneratorService.ts の分類ロジックで
// client/src/data/food-dictionary/*.json を再生成する。
// 何度でも再実行してよい（既存のJSONファイルは毎回上書きされる）。
//
// 未分類だった商品は logs/unknown-food-names.json に出力する。

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateDictionary,
  mergeSeedTerms,
  DICTIONARY_CATEGORIES,
  type RakutenGenre,
  type RakutenProductSample,
} from "../client/src/services/dictionaryGeneratorService.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "client/src/data/food-dictionary");
const LOG_PATH = path.join(ROOT, "logs/unknown-food-names.json");

const HOST = "openapi.rakuten.co.jp";
const PATH_BASE = "/ichibams/api/IchibaItem/Search/20260701";

function cfg() {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const referer = process.env.RAKUTEN_REFERER || "http://example.com/";
  if (!appId || !accessKey) {
    throw new Error(
      "RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定です。 node --env-file=server/.env scripts/generateFoodDictionary.ts の形式で実行してください。"
    );
  }
  let origin: string;
  try {
    origin = new URL(referer).origin;
  } catch {
    origin = "http://example.com";
  }
  return { appId, accessKey, referer, origin };
}

function rakutenGet(requestPath: string): Promise<any> {
  const { referer, origin } = cfg();
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: HOST,
        path: requestPath,
        headers: { Referer: referer, Origin: origin, Accept: "application/json" },
        timeout: 20000,
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          let json: any = null;
          try {
            json = JSON.parse(d);
          } catch {
            /* noop */
          }
          if (res.statusCode === 200 && json) resolve(json);
          else {
            const msg = json?.errors?.errorMessage || `HTTP ${res.statusCode}`;
            reject(new Error(`楽天市場API エラー (${res.statusCode}): ${msg}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("楽天市場APIタイムアウト")));
  });
}

function authQuery(extra: Record<string, string | number>): string {
  const { appId, accessKey } = cfg();
  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    formatVersion: "2",
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  });
  return params.toString();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ジャンル別の検索キーワード一覧。ここに追加するだけで辞書のカバー範囲を広げられる。
const SEARCH_PLAN: { genre: RakutenGenre; keywords: string[] }[] = [
  {
    genre: "meat",
    keywords: ["豚肉", "牛肉", "鶏肉", "黒毛和牛", "ハム", "ソーセージ", "焼肉", "ホルモン", "馬肉", "ジビエ"],
  },
  {
    genre: "seafood",
    keywords: ["鮭", "ホタテ", "カニ", "うなぎ", "牡蠣", "いくら", "たらこ", "しらす", "干物", "エビ", "イカ", "ふぐ"],
  },
  {
    genre: "vegetable",
    keywords: [
      "とうもろこし", "たまねぎ", "じゃがいも", "トマト", "にんじん", "アスパラガス", "かぼちゃ", "長芋",
      "白菜", "レタス", "きゅうり", "ごぼう",
    ],
  },
  {
    genre: "fruit",
    keywords: ["りんご", "みかん", "ぶどう", "いちご", "梨", "桃", "メロン", "キウイ", "柿", "レモン", "栗"],
  },
  {
    genre: "processed",
    keywords: [
      "カレー", "味噌", "ジャム", "餃子", "焼売", "ハンバーグ", "漬物", "梅干し", "ソーセージ", "かまぼこ",
      "佃煮", "ドレッシング",
    ],
  },
];

const HITS_PER_PAGE = 30;
const PAGES_PER_KEYWORD = 2;
const REQUEST_INTERVAL_MS = 1200; // 楽天APIのレート制限を避けるための間隔

async function fetchSamplesForKeyword(genre: RakutenGenre, keyword: string): Promise<RakutenProductSample[]> {
  const samples: RakutenProductSample[] = [];
  for (let page = 1; page <= PAGES_PER_KEYWORD; page++) {
    try {
      const query = authQuery({
        keyword: `ふるさと納税 訳あり ${keyword}`,
        hits: HITS_PER_PAGE,
        page,
        imageFlag: 1,
        availability: 1,
      });
      const data = await rakutenGet(`${PATH_BASE}?${query}`);
      const items = data.Items || data.items || [];
      for (const item of items) {
        if (!item.itemName) continue;
        samples.push({
          itemCode: item.itemCode || item.itemUrl || item.itemName,
          itemName: item.itemName,
          itemCaption: item.itemCaption,
          genre,
        });
      }
      console.log(`  [${genre}] "${keyword}" page${page}: ${items.length}件`);
    } catch (err) {
      console.warn(`  [${genre}] "${keyword}" page${page} 取得失敗: ${(err as Error).message}`);
    }
    await sleep(REQUEST_INTERVAL_MS);
  }
  return samples;
}

async function main() {
  console.log("=== 商品名抽出辞書の自動生成を開始します ===");
  const allSamples: RakutenProductSample[] = [];
  const seenItemCodes = new Set<string>();

  for (const { genre, keywords } of SEARCH_PLAN) {
    for (const keyword of keywords) {
      const samples = await fetchSamplesForKeyword(genre, keyword);
      for (const s of samples) {
        // 同じ商品が複数キーワードでヒットすることがあるため、商品コードで重複除去する
        if (seenItemCodes.has(s.itemCode)) continue;
        seenItemCodes.add(s.itemCode);
        allSamples.push(s);
      }
    }
  }

  console.log(`\n収集した商品数（ユニーク）: ${allSamples.length}件`);
  console.log("辞書を生成しています...");

  const { dictionary: generated, report, unknown } = generateDictionary(allSamples);
  // 頻度・分類ヒューリスティックだけでは漏れがちな既知の重要語をシードとして補強する
  const dictionary = mergeSeedTerms(generated);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const fileNameByCategory: Record<string, string> = {
    series: "series.json",
    brands: "brands.json",
    varieties: "varieties.json",
    compoundFoods: "compound-foods.json",
    processedFoods: "processed-foods.json",
    ingredients: "ingredients.json",
  };
  for (const category of DICTIONARY_CATEGORIES) {
    const filePath = path.join(OUTPUT_DIR, fileNameByCategory[category]);
    fs.writeFileSync(filePath, `${JSON.stringify(dictionary[category], null, 2)}\n`, "utf-8");
  }

  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, `${JSON.stringify(unknown, null, 2)}\n`, "utf-8");

  console.log("\n=== 品質チェック ===");
  console.log("カテゴリ別件数（シード補強後・JSON出力に反映された最終件数）:");
  let totalTerms = 0;
  for (const category of DICTIONARY_CATEGORIES) {
    const count = dictionary[category].length;
    totalTerms += count;
    console.log(`  ${category}: ${count}件`);
  }
  console.log(`  合計: ${totalTerms}件`);
  console.log(`重複数（除去前候補数 - 重複除去後のユニーク候補数）: ${report.duplicatesRemoved}`);
  console.log(`削除件数（頻度不足等で辞書に不採用になった候補数）: ${report.deletedByLowFrequency}`);
  console.log(`抽出できなかった商品数: ${report.unmatchedProductCount}件`);
  console.log(`\n出力先: ${OUTPUT_DIR}`);
  console.log(`未一致ログ: ${LOG_PATH}`);
  console.log("=== 完了 ===");
}

main().catch((err) => {
  console.error("辞書生成中にエラーが発生しました:", err);
  process.exit(1);
});
