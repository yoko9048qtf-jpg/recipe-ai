// 楽天APIの商品名はSEO対策のキーワード・配送情報・産地表記などが大量に含まれ、
// 一覧・モーダルでは「何の商品か」が伝わりにくい。
// このファイルの責務は、そこから「ブランド名・品種名・加工食品名・食材名」を取り出し、
// 「思わずクリックしたくなる」表示用の商品名を生成することであり、単純な文字数短縮ではない。
// 元データ（product.name）は変更しない。呼び出し側（ProductCard/ProductModal）は
// formatProductName() のみを呼び出す。
//
// アルゴリズム概要:
//   A. 自動生成辞書（services/dictionaryService.ts が読み込む data/food-dictionary/*.json）と
//      原文を直接照合する。一致すればその名称を最優先で採用する
//      （series → brands → varieties → compoundFoods → processedFoods → ingredients の順）。
//      辞書照合は文字間の空白ゆれ（例:「国産豚肉 切り落とし」）を許容するため、
//      SEOワードに埋もれていても検出できる。
//   B. 辞書に一致しない場合、ルールベースの除去パイプラインを実施する
//      ① 不要キーワード除去 → ② 数量・重量・容量除去 → ③ 配送・販促情報除去 →
//      ④ 括弧の解析（ブランド名・品種名らしい括弧内を優先） → ⑤ 地域名・自治体名の除去
//   C. パイプラインで整形した後のテキストに対しても、辞書照合を再度試みる
//      （ノイズ語に阻まれて辞書照合Aで見つからなかった名称を拾うための保険）。
//   D. それでも意味のある文字列が残らない場合は、軽く整形した元タイトルを
//      最大20文字程度で表示する（無理な短縮は避ける）。
//
// 辞書自体は手入力ではなく scripts/generateFoodDictionary.ts で楽天APIの実商品データから
// 自動生成する。辞書の更新はスクリプトの再実行のみで完結し、本ファイルの変更は不要。

import { foodDictionary, DICTIONARY_LOOKUP_ORDER } from "../services/dictionaryService";

// 優先度順の辞書階層（先に登場する階層ほど優先して採用される）
const DICTIONARY_TIERS: string[][] = DICTIONARY_LOOKUP_ORDER.map((category) => foodDictionary[category]);

// ===== ①〜⑤ルールベース抽出で使う配列（すべて追加・削除しやすいよう配列で管理） =====

// 【...】で囲まれた宣伝文句・締切表記（例:【ふるさと納税】【2026年7月下旬発送予定】）は
// 常にまとめて除去する
const BRACKETED_TAG_PATTERN = /【[^】]*】/g;

// ①除去キーワード（SEO・宣伝目的の一般的な装飾語）
const REMOVE_KEYWORDS: RegExp[] = [
  /ふるさと納税/g,
  /訳あり/g,
  /返礼品/g,
  /選べる/g,
  /期間限定/g,
  /数量限定/g,
  /早期予約/g,
  /先行予約/g,
  /キャンペーン/g,
];

// ②数量・重量・容量パターン（表示名からは完全に除去する）
const QUANTITY_PATTERNS: RegExp[] = [
  /\d{1,2}\/\d{1,2}\s*(まで受付延長|締切|受付終了)?/g, // 日付・締切（例: 7/15締切）
  /[\d０-９]+(?:[.,][\d０-９]+)?\s*(?:kg|g|ｇ|個|本|枚|パック|セット|人前|玉|尾|匹|袋|箱|房|杯|切れ|羽)/g,
  /\d+\s*[〜~～\-−]\s*\d+/g, // 範囲表記（例: 72~180）
];

// ③配送キーワード
const DELIVERY_KEYWORDS: RegExp[] = [
  /最短翌日発送/g,
  /翌日発送/g,
  /\d+営業日(以内発送)?/g,
  /順次発送/g,
  /発送月/g,
  /冷凍/g,
  /冷蔵/g,
  /常温/g,
  /お届け/g,
];

// ③販促キーワード
const PROMO_KEYWORDS: RegExp[] = [
  /人気/g,
  /おすすめ/g,
  /高評価/g,
  /ランキング/g,
  /送料無料/g,
  /満足度\s*\d+\s*[%％]/g,
  /\d+位獲得/g,
  /大人気/g,
  /新鮮/g,
];

// ⑤地域名・自治体名パターン（都道府県名 + 市区町村＋産の表記を除去する。
// 「国産」のように地名を指さない語は誤って除去しないよう明示的に保護する）
const PREFECTURE_PATTERN =
  /(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)産?/g;
const MUNICIPALITY_PATTERN = /[一-龥]{1,4}(?:市|町|村|郡)産?/g;
// 「〇〇産」（都道府県・市区町村を伴わない短い地名＋産）。「国産」だけは除去しない。
const SHORT_REGION_PATTERN = /([一-龥]{1,4})産/g;
const REGION_PATTERNS: RegExp[] = [PREFECTURE_PATTERN, MUNICIPALITY_PATTERN];

// 表示用商品名の上限文字数（フォールバック含め最大20文字程度）
const MAX_DISPLAY_LENGTH = 20;

/** 文字列中の正規表現特殊文字をエスケープする */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 辞書の語を、文字間の空白ゆれ（例: "国産豚肉 切り落とし"）を許容する正規表現に変換する */
function buildFlexibleMatcher(term: string): RegExp {
  const pattern = term.split("").map(escapeRegExp).join("\\s*");
  return new RegExp(pattern);
}

/** 辞書1階層分から、text中に含まれる語を探す（より具体的な語を優先するため長い語から試す） */
function findInTier(text: string, tier: string[]): string | undefined {
  const sorted = [...tier].sort((a, b) => b.length - a.length);
  return sorted.find((term) => buildFlexibleMatcher(term).test(text));
}

/** 辞書（ブランド名・シリーズ名→品種名→加工食品名→食材名の順）から一致する名称を探す */
function matchDictionary(text: string): string | undefined {
  for (const tier of DICTIONARY_TIERS) {
    const hit = findInTier(text, tier);
    if (hit) return hit;
  }
  return undefined;
}

/** 文字列がSEO・販促・配送・数量ワードを含む「販促文言」らしいか */
function looksPromotional(text: string): boolean {
  const allNoisePatterns = [...REMOVE_KEYWORDS, ...DELIVERY_KEYWORDS, ...PROMO_KEYWORDS, ...QUANTITY_PATTERNS];
  return allNoisePatterns.some((p) => new RegExp(p.source).test(text));
}

// 括弧内の候補から除外する、定期便・予約受付などの事務的な語（ブランド名・品種名ではないもの）
const BRACKET_EXCLUDE_KEYWORDS = ["予約受付", "毎月", "隔月", "受付中", "販売中", "出荷時期", "土日祝"];

/** 括弧の中身が「ブランド名・品種名らしい」候補かどうか（数字を含まない・事務的な語でない・短い） */
function looksLikeBrandOrVariety(text: string): boolean {
  if (text.length === 0 || text.length > 12) return false;
  if (/[\d０-９]/.test(text)) return false;
  if (BRACKET_EXCLUDE_KEYWORDS.some((kw) => text.includes(kw))) return false;
  return !looksPromotional(text);
}

/** ④括弧（（）/()）の中身を抜き出す。ブランド名・品種名らしい候補があれば返す */
function extractBracketCandidate(text: string): string | undefined {
  const matches = [...text.matchAll(/[（(]([^）)]+)[）)]/g)].map((m) => m[1].trim());
  return matches.find(looksLikeBrandOrVariety);
}

/** ①〜⑤の除去ルールを順に適用する（辞書に一致しなかった場合のフォールバック抽出） */
function ruleBasedExtract(rawName: string): string {
  // 【】タグは常に除去した上で、括弧候補（ブランド名・品種名らしいもの）を先に確保しておく
  let text = rawName.replace(BRACKETED_TAG_PATTERN, " ");
  const bracketCandidate = extractBracketCandidate(text);

  // ①不要キーワード除去
  for (const pattern of REMOVE_KEYWORDS) text = text.replace(pattern, " ");
  // ②数量・重量・容量除去
  for (const pattern of QUANTITY_PATTERNS) text = text.replace(pattern, " ");
  // ③配送・販促情報除去
  for (const pattern of DELIVERY_KEYWORDS) text = text.replace(pattern, " ");
  for (const pattern of PROMO_KEYWORDS) text = text.replace(pattern, " ");
  // ④括弧そのものは除去（中身の採否は上で判定済み）
  text = text.replace(/[（(][^）)]*[）)]/g, " ");
  // ⑤地域名・自治体名除去（「国産」は地名ではないため保護する）
  for (const pattern of REGION_PATTERNS) text = text.replace(pattern, " ");
  text = text.replace(SHORT_REGION_PATTERN, (match, place: string) => (place === "国" ? match : " "));

  text = text.replace(/\s+/g, " ").trim();

  // 括弧内がブランド名・品種名らしい場合は、本文抽出結果より優先する
  if (bracketCandidate) return bracketCandidate;
  return text;
}

/** 軽い整形のみ（【】タグの除去と空白整理）。何も抽出できなかった場合の最終フォールバック用 */
function basicClean(rawName: string): string {
  return rawName.replace(BRACKETED_TAG_PATTERN, " ").replace(/\s+/g, " ").trim();
}

function truncate(text: string): string {
  if (text.length <= MAX_DISPLAY_LENGTH) return text;
  return `${text.slice(0, MAX_DISPLAY_LENGTH).trim()}...`;
}

/**
 * 楽天APIの商品名（product.name、元データは変更しない）から、
 * 「思わずクリックしたくなる」表示用の商品名を生成する。
 *
 * 呼び出し側（ProductCard/ProductModal）はこの関数のみを呼び出せばよく、
 * 将来的にAIによる商品名要約に差し替える場合も、この関数の中身を差し替えるだけでよい。
 */
export function formatProductName(rawName: string): string {
  // A. 辞書照合（原文に対して直接。ノイズに埋もれた名称も空白ゆれ許容で検出する）
  const earlyHit = matchDictionary(rawName);
  if (earlyHit) return truncate(earlyHit);

  // B. ルールベースの除去パイプライン（①〜⑤）
  const extracted = ruleBasedExtract(rawName);

  // C. 整形後のテキストに対して辞書照合を再試行する（⑥⑦⑧）
  const lateHit = matchDictionary(extracted);
  if (lateHit) return truncate(lateHit);

  if (extracted.length >= 2) return truncate(extracted);

  // D. 抽出できなかった場合: 軽く整形した元タイトルを最大20文字程度で表示する
  return truncate(basicClean(rawName));
}
