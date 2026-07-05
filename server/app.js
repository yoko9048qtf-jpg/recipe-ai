import express from "express";
import { getRankings } from "./rakuten.js";
import { searchFoodLossProducts, mapRakutenItemToProduct } from "./rakutenIchiba.js";
import { detectIngredients } from "./vision.js";
import { generateRecipeDetail } from "./steps.js";
import { fisherYatesShuffle } from "./utils/shuffle.js";

// Express アプリ本体。ローカル開発(server/index.js)・Vercel サーバーレス関数(api/index.js)
// の両方から import して使う（`app.listen()` はここでは呼ばない）。
const app = express();
// 写真は base64 で送られてくるため上限を引き上げる
app.use(express.json({ limit: "12mb" }));

// 提案するレシピ件数
const RESULT_COUNT = 10;

// 気分（ジャンル）→ 楽天レシピの大カテゴリID。
// primary: そのジャンルを代表するカテゴリ（優先）。
// supplement: 件数・バリエーション確保のための近いジャンル/汎用カテゴリ（補完）。
// 補完には ご飯もの(14, 丼) や 麺・粉物(16, 麺類) を含め、主菜・麺・丼などが混ざるようにする。
const GENRES = {
  japanese: { primary: ["31", "32", "14"], supplement: ["16", "35", "48", "38"] },
  western: { primary: ["25", "15"], supplement: ["14", "31", "16", "43"] },
  chinese: { primary: ["41"], supplement: ["42", "46", "14", "16"] },
  italian: { primary: ["43", "15"], supplement: ["25", "16", "14"] },
};
const VALID_CUISINES = Object.keys(GENRES);

// 常備の調味料・粉類（日本語）。不足材料に含めない。
// 短く誤検出しやすい語（塩・油・酒・酢・水）は完全一致のみ。
const PANTRY_EXACT = ["塩", "油", "酒", "酢", "水", "湯"];
const PANTRY_INCLUDES = [
  "醤油", "しょうゆ", "味噌", "みそ", "みりん", "砂糖", "料理酒",
  "サラダ油", "オリーブオイル", "ごま油", "ゴマ油", "ケチャップ", "マヨネーズ",
  "ソース", "こしょう", "胡椒", "コショウ", "だし", "出汁", "白だし", "めんつゆ",
  "ポン酢", "鶏がらスープ", "コンソメ", "ブイヨン", "バター", "片栗粉", "小麦粉",
  "薄力粉", "強力粉", "揚げ油", "ごま油", "オイスターソース", "豆板醤", "コチュジャン",
];

/** "★玉ねぎ 1個" → "玉ねぎ"（先頭の記号を除去し、分量やかっこ前で切る） */
function materialName(line) {
  let s = String(line).trim();
  // 先頭の装飾記号・番号（★☆◆●○・※＊＊①② 等）を除去
  s = s.replace(/^[\s　★☆◇◆●○◎〇■□▲△▼▽・※＊*＋\-—–.0-9０-９①-⑳㊥]+/, "");
  return s.split(/[\s　(（]/)[0].trim();
}

// タイトルに含まれていたら「主菜ではない」とみなす語（ソース・ドレッシング等）
const NON_MAIN_TITLE = [
  "ソース", "ドレッシング", "ふりかけ", "ジャム", "ペースト", "ディップ",
  "シロップ", "コンフィチュール", "スプレッド", "薬味",
];
function looksMain(title) {
  const t = String(title);
  return !NON_MAIN_TITLE.some((w) => t.includes(w));
}

/** 材料配列に混ざる見出し（＜つくねの材料＞ など）か */
function isSectionHeader(line) {
  const s = String(line).trim();
  return /^[＜<【[]/.test(s) || /[＞>】\]]$/.test(s);
}

function isPantryJa(line) {
  const name = materialName(line);
  if (!name) return false;
  if (PANTRY_EXACT.includes(name)) return true;
  return PANTRY_INCLUDES.some((p) => name.includes(p));
}

// 表記ゆれ（かな/漢字/カタカナ・部位違い）を吸収する同義語グループ。
// 各グループの先頭を代表表記とし、照合時に正規化して比較する。
const SYNONYM_GROUPS = [
  ["にんじん", "人参", "ニンジン"],
  ["たまねぎ", "玉ねぎ", "玉葱", "タマネギ"],
  ["じゃがいも", "じゃが芋", "ジャガイモ", "馬鈴薯"],
  ["卵", "たまご", "玉子", "タマゴ", "鶏卵"],
  ["ねぎ", "ネギ", "葱", "長ねぎ", "長ネギ", "青ねぎ", "青ネギ", "小ねぎ", "万能ねぎ", "細ねぎ"],
  ["鶏肉", "とり肉", "鳥肉", "チキン", "鶏もも", "鶏むね", "鶏ムネ", "鶏挽肉", "鶏ひき肉", "鶏胸", "鶏もも肉", "鶏むね肉"],
  ["豚肉", "ぶた肉", "豚バラ", "豚こま", "豚ロース", "豚ひき肉", "豚挽肉", "豚もも"],
  ["牛肉", "牛バラ", "牛こま", "牛もも", "牛ひき肉"],
  ["きゅうり", "キュウリ", "胡瓜"],
  ["キャベツ", "きゃべつ"],
  ["トマト", "とまと", "ミニトマト", "プチトマト"],
  ["なす", "ナス", "茄子"],
  ["ピーマン"],
  ["ほうれん草", "ほうれんそう", "ホウレンソウ"],
  ["牛乳", "ミルク"],
  ["ご飯", "ごはん", "白米", "お米", "ライス", "白ご飯", "ご飯（", "温かいご飯", "ホカホカご飯"],
  ["食パン", "トースト"],
  ["パスタ", "スパゲティ", "スパゲッティ", "スパゲッティー"],
  ["豆腐", "とうふ"],
  ["鮭", "さけ", "サーモン", "サケ"],
  ["ツナ", "ツナ缶", "シーチキン"],
];

/** トークンを同義語グループの代表表記に正規化する（短い語の誤マッチを避ける） */
function normalize(token) {
  const t = String(token);
  if (!t) return t;
  for (const g of SYNONYM_GROUPS) {
    for (const m of g) {
      const hit = m.length >= 2 ? t.includes(m) || m.includes(t) : t === m;
      if (hit) return g[0];
    }
  }
  return t;
}

/** 材料名と手持ち食材が一致するか（部分一致 or 同義語） */
function termsMatch(matName, term) {
  if (!matName || !term) return false;
  if (matName.includes(term) || term.includes(matName)) return true;
  return normalize(matName) === normalize(term);
}

/** 材料が手持ち食材のいずれかに該当するか（日本語・表記ゆれ対応） */
function isAvailableJa(line, haveList) {
  const name = materialName(line);
  if (!name) return false;
  return haveList.some((h) => termsMatch(name, h.trim()));
}

function errorMessage(err) {
  const m = err?.message || "";
  if (/RAKUTEN_|applicationId|accessKey|REFERRER|403|認証/i.test(m)) {
    return `楽天APIにアクセスできません（${m}）。環境変数のキーと許可ドメイン設定を確認してください。`;
  }
  return m || "サーバーエラーが発生しました。";
}

const VALID_FOOD_TYPES = ["meat", "seafood", "vegetable", "fruit", "processed"];
const VALID_REGIONS = [
  "hokkaido", "tohoku", "kanto", "chubu", "kinki", "chugoku-shikoku", "kyushu-okinawa",
];
const VALID_PRICE_RANGES = ["under-5000", "5001-10000", "10001-30000", "over-30001"];

// --- おすすめレシピ（ジャンル人気 + 冷蔵庫の食材で並べ替え・不足材料注記） ---
app.post("/api/recipes", async (req, res) => {
  try {
    const ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
    if (ingredients.length === 0) {
      return res.status(400).json({ error: "食材を1つ以上指定してください。" });
    }
    const cuisine = VALID_CUISINES.includes(req.body?.cuisine)
      ? req.body.cuisine
      : "japanese";
    // 直近表示履歴（クライアントの localStorage 由来）。表示の偏りを避けるための除外に使う
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const historySet = new Set(history);
    const { primary, supplement } = GENRES[cuisine];

    // 選択ジャンル（primary）を優先取得。認証エラー等は伝播させる。
    const primaryRecipes = await getRankings(primary);
    primaryRecipes.forEach((r) => (r._primary = true));
    // 補完ジャンル（supplement）は失敗しても続行（件数が足りない時の補い）。
    let supplementRecipes = [];
    try {
      supplementRecipes = await getRankings(supplement);
    } catch (e) {
      console.warn(`[rakuten] supplement 取得失敗: ${e.message}`);
    }
    supplementRecipes.forEach((r) => (r._primary = false));

    // recipeId で重複除去（先勝ち＝primary を優先）
    const seen = new Set();
    const pool = [];
    for (const r of [...primaryRecipes, ...supplementRecipes]) {
      if (!seen.has(r.recipeId)) {
        seen.add(r.recipeId);
        pool.push(r);
      }
    }

    // 各レシピを「冷蔵庫の食材をいくつ使うか」で採点し、不足材料を算出
    const scored = pool.map((r) => {
      const items = (r.recipeMaterial || []).filter((m) => m && !isSectionHeader(m));
      const usedCount = ingredients.filter((ing) =>
        items.some((m) => termsMatch(materialName(m), ing.trim()))
      ).length;
      const missing = items.filter(
        (m) => !isAvailableJa(m, ingredients) && !isPantryJa(m)
      );
      return {
        r,
        items,
        usedCount,
        missing,
        main: looksMain(r.recipeTitle),
        primary: !!r._primary,
        cat: r._cat,
      };
    });

    // スコア = 手持ち食材を多く使うほど高い ＋ 選択ジャンル一致ボーナス（埋もれない程度）
    //          － 不足材料が多いほど僅かに下げる（同点時の調整）
    const GENRE_BONUS = 2;
    const scoreOf = (s) =>
      s.usedCount + (s.primary ? GENRE_BONUS : 0) - s.missing.length * 0.05;
    // 並び: まず主菜を優先（ソース等を後ろへ）、その中でスコア順
    scored.sort(
      (a, b) => Number(b.main) - Number(a.main) || scoreOf(b) - scoreOf(a)
    );

    // バリエーション確保: 補完カテゴリは1カテゴリ最大2件まで（primaryは上限なし）。
    // 同系統の料理ばかりにならないよう、主菜・麺・丼・副菜などを混ぜる効果。
    // ここでは表示件数に絞らず、ランク順を保ったまま全件を並べ替える
    // （この後の履歴除外・シャッフルの土台として使うため）。
    const counts = {};
    const capped = [];
    const overCapped = [];
    for (const s of scored) {
      const cap = s.primary ? Infinity : 2;
      if ((counts[s.cat] || 0) < cap) {
        capped.push(s);
        counts[s.cat] = (counts[s.cat] || 0) + 1;
      } else {
        overCapped.push(s);
      }
    }
    // 上限制限で件数が足りない場合に備え、キャップ超過分もランク順のまま末尾に保持
    const rankedCandidates = [...capped, ...overCapped];

    // 履歴除外: 直近表示していないレシピを優先し、不足する場合のみ履歴レシピで補う
    const fresh = [];
    const seenBefore = [];
    for (const s of rankedCandidates) {
      (historySet.has(s.r.recipeId) ? seenBefore : fresh).push(s);
    }
    const selected =
      fresh.length >= RESULT_COUNT
        ? fresh.slice(0, RESULT_COUNT)
        : [...fresh, ...seenBefore.slice(0, RESULT_COUNT - fresh.length)];

    // Fisher-Yates Shuffle: 選定結果（件数・ランキング品質）は変えず、表示順のみランダム化
    const picked = fisherYatesShuffle(selected);

    const recipes = picked.map(({ r, items, usedCount, missing }) => ({
      id: r.recipeId,
      title: r.recipeTitle,
      image: r.foodImageUrl || r.mediumImageUrl || r.smallImageUrl || "",
      url: r.recipeUrl,
      indication: r.recipeIndication || "",
      cost: r.recipeCost || "",
      materials: items, // 見出しを除いた材料（日本語・原文の分量つき）
      missingMaterials: missing,
      usedCount,
      missedCount: missing.length,
    }));

    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: errorMessage(err) });
  }
});

// --- レシピ詳細（AI生成）。指定人数分の材料（分量つき）＋ 作り方を生成する ---
// 楽天APIは人数・構造化分量・手順を返さないため、AIで作成する。
app.post("/api/recipe-detail", async (req, res) => {
  try {
    const title = req.body?.title;
    const materials = Array.isArray(req.body?.materials) ? req.body.materials : [];
    const have = Array.isArray(req.body?.have) ? req.body.have : [];
    const servings = Number(req.body?.servings);

    if (!title) {
      return res.status(400).json({ error: "レシピ名が指定されていません。" });
    }
    // 重要ルール: 人数が未入力ならレシピを生成しない
    if (!Number.isInteger(servings) || servings < 1 || servings > 99) {
      return res
        .status(400)
        .json({ error: "何人分の料理を作りますか？人数を1〜99の整数で指定してください。" });
    }

    const { ingredients, steps } = await generateRecipeDetail(title, materials, servings);

    // 不足材料の判定（AI生成の材料名に対して、手持ち食材・常備調味料で照合）
    const withMissing = ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      missing: !isAvailableJa(ing.name, have) && !isPantryJa(ing.name),
    }));

    res.json({ servings, ingredients: withMissing, steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: errorMessage(err) });
  }
});

// --- 写真から食材抽出（Claude ビジョン） ---
app.post("/api/detect-ingredients", async (req, res) => {
  try {
    const image = req.body?.image;
    if (!image) {
      return res.status(400).json({ error: "画像が指定されていません。" });
    }
    const ingredients = await detectIngredients(image);
    res.json({ ingredients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: errorMessage(err) });
  }
});

// --- 食品ロス特設ページ: ふるさと納税商品検索（楽天市場API） ---
app.get("/api/food-loss-products", async (req, res) => {
  try {
    const kind = req.query.kind;
    const filter = { kind };

    if (kind === "food-type") {
      if (!VALID_FOOD_TYPES.includes(req.query.foodType)) {
        return res.status(400).json({ error: "foodTypeの指定が不正です。" });
      }
      filter.foodType = req.query.foodType;
    } else if (kind === "region") {
      if (!VALID_REGIONS.includes(req.query.region)) {
        return res.status(400).json({ error: "regionの指定が不正です。" });
      }
      filter.region = req.query.region;
    } else if (kind === "price") {
      if (!VALID_PRICE_RANGES.includes(req.query.priceRange)) {
        return res.status(400).json({ error: "priceRangeの指定が不正です。" });
      }
      filter.priceRange = req.query.priceRange;
    } else {
      return res.status(400).json({ error: "kindの指定が不正です。" });
    }

    const items = await searchFoodLossProducts(filter);
    const products = items.map((item) => mapRakutenItemToProduct(item, filter));
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: errorMessage(err) });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default app;
