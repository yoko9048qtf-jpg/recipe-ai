// 商品名抽出辞書の自動生成ロジック（純粋関数のみ。I/O・Rakuten APIへの通信は行わない）。
// 実際にRakuten APIから商品情報を集めて本サービスを呼び出すのは scripts/generateFoodDictionary.ts。
//
// 生成フロー: ①不要キーワード除去 → ②括弧解析 → ③ジャンル判定（呼び出し側から渡される）→
//            ④単語抽出 → ⑤出現頻度集計 → ⑥辞書カテゴリ分類 → ⑦JSON出力（呼び出し側）

export type DictionaryCategory =
  | "series"
  | "brands"
  | "varieties"
  | "compoundFoods"
  | "processedFoods"
  | "ingredients";

export const DICTIONARY_CATEGORIES: DictionaryCategory[] = [
  "series",
  "brands",
  "varieties",
  "compoundFoods",
  "processedFoods",
  "ingredients",
];

// 楽天APIの商品ジャンル（検索に使ったキーワード上位カテゴリ）
export type RakutenGenre = "meat" | "seafood" | "vegetable" | "fruit" | "processed";

export interface RakutenProductSample {
  itemCode: string;
  itemName: string;
  itemCaption?: string;
  genre: RakutenGenre;
}

export type GeneratedDictionary = Record<DictionaryCategory, string[]>;

export interface UnknownProductRecord {
  itemCode: string;
  itemName: string;
  displayName: string;
  reason: string;
}

export interface DictionaryGenerationReport {
  categoryCounts: Record<DictionaryCategory, number>;
  totalCandidatesBeforeDedupe: number;
  duplicatesRemoved: number;
  deletedByLowFrequency: number;
  unmatchedProductCount: number;
}

export interface DictionaryGenerationResult {
  dictionary: GeneratedDictionary;
  report: DictionaryGenerationReport;
  unknown: UnknownProductRecord[];
}

// ===== ①不要キーワード除去 =====
const BRACKETED_TAG_PATTERN = /【[^】]*】/g;
const NOISE_PATTERNS: RegExp[] = [
  /ふるさと納税/g,
  /訳あり/g,
  /人気/g,
  /おすすめ/g,
  /高評価/g,
  /送料無料/g,
  /ランキング/g,
  /返礼品/g,
  /期間限定/g,
  /数量限定/g,
  /選べる/g,
  /早期予約/g,
  /先行予約/g,
  /キャンペーン/g,
  /最短翌日発送/g,
  /翌日発送/g,
  /\d+営業日(以内発送)?/g,
  /順次発送/g,
  /発送月/g,
  /冷凍/g,
  /冷蔵/g,
  /常温/g,
  /お届け/g,
  /満足度\s*\d+\s*[%％]/g,
  /\d+位獲得/g,
  /大人気/g,
  /新鮮/g,
  /[\d０-９]+(?:[.,][\d０-９]+)?\s*(?:kg|g|ｇ|個|本|枚|パック|セット|人前|玉|尾|匹|袋|箱|房|杯|切れ|羽)/g,
  /\d+\s*[〜~～\-−]\s*\d+/g,
  /\d{1,2}\/\d{1,2}\s*(まで受付延長|締切|受付終了)?/g,
];
const PREFECTURE_PATTERN =
  /(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)産?/g;
const MUNICIPALITY_PATTERN = /[一-龥]{1,4}(?:市|町|村|郡)産?/g;

/** ①不要キーワード・⑤地域名を除去する（表示用フォーマッタと共通の考え方） */
function removeNoise(rawText: string): string {
  let text = rawText.replace(BRACKETED_TAG_PATTERN, " ");
  for (const pattern of NOISE_PATTERNS) text = text.replace(pattern, " ");
  text = text.replace(PREFECTURE_PATTERN, " ").replace(MUNICIPALITY_PATTERN, " ");
  text = text.replace(/([一-龥]{1,4})産/g, (m, place: string) => (place === "国" ? m : " "));
  // 括弧の中身は②で候補として個別に扱うため、本文側では括弧記号ごと除去する
  text = text.replace(/[（(][^）)]*[）)]?/g, " ").replace(/[）)]/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

// 助詞・接続語・意味を持たない断片語（候補から除外する）
const STOPWORDS = new Set([
  "とし", "ない", "のような", "ある", "いる", "する", "など", "これ", "それ", "あれ",
  "ため", "こと", "もの", "とき", "よう", "から", "まで", "および", "または", "です",
  "ます", "した", "して", "され", "なる", "ので", "けど", "しかし",
]);

function isStopword(term: string): boolean {
  return STOPWORDS.has(term);
}

// ===== ②括弧解析 =====
function extractBracketPhrases(rawText: string): string[] {
  return [...rawText.matchAll(/[（(]([^）)]+)[）)]/g)]
    .map((m) => m[1].trim())
    .filter((p) => p.length >= 2 && p.length <= 12 && !/[\d０-９]/.test(p));
}

// ===== ④単語抽出 =====
// 空白・区切り文字でチャンク化した上で、単体チャンクと隣接2チャンクの結合（複合語候補）の両方を候補にする。
// 日本語は形態素解析なしでは正確な分かち書きが難しいため、簡易的なヒューリスティックで代替している。
const SCRIPT_RUN_PATTERN = /[ぁ-ん]+|[ァ-ヶー]+|[一-龥]+|[A-Za-zＡ-Ｚａ-ｚ]+/g;

// 区切り記号として扱う文字（｜！★●○◎〇■□▲△▼▽※＊・全角/半角バリエーションを含む）
const SEPARATOR_PATTERN = /[\s、,，・･｜|/／！!★☆●○◎〇■□▲△▼▽※＊*]+/;

/** 前半と後半が同一（例:「蒲焼き蒲焼き」）の重複パターンを弾く */
function isDuplicatedHalves(term: string): boolean {
  if (term.length < 4 || term.length % 2 !== 0) return false;
  const half = term.length / 2;
  return term.slice(0, half) === term.slice(half);
}

/** 価格・数量の残骸（例:「10000円」）らしい候補を弾く */
function looksLikeNumericNoise(term: string): boolean {
  return /^[\d０-９]/.test(term) || /円$/.test(term);
}

// 物流・販促目的の定型語（これ同士の組み合わせは複合"食品名"としては採用しない）
const LOGISTICS_MARKETING_WORDS = new Set([
  "訳あり", "訳アリ", "わけあり", "規格外", "不揃い", "ふぞろい", "家庭用", "自宅用",
  "小分け", "個包装", "大容量", "簡易包装", "簡単調理", "産地直送", "農家直送",
  "お取り寄せ", "お取り寄せグルメ", "グルメ", "ギフト", "プレゼント", "贈り物", "贈答",
  "セット", "詰め合わせ", "定期便", "定期コース", "惣菜", "おかず", "おつまみ", "弁当",
  "ご飯のお供", "ごはんのお供", "送料無料", "離乳食", "保存食", "業務用",
]);

function isLogisticsMarketingBigram(chunkA: string, chunkB: string): boolean {
  return LOGISTICS_MARKETING_WORDS.has(chunkA) && LOGISTICS_MARKETING_WORDS.has(chunkB);
}

function extractCandidateTerms(cleanedText: string): { term: string; isCompoundGuess: boolean }[] {
  const chunks = cleanedText.split(SEPARATOR_PATTERN).filter((c) => c.length >= 2);
  const results: { term: string; isCompoundGuess: boolean }[] = [];

  for (const chunk of chunks) {
    if (chunk.length <= 12 && !isDuplicatedHalves(chunk) && !looksLikeNumericNoise(chunk)) {
      results.push({ term: chunk, isCompoundGuess: false });
    }
    // スクリプト境界（ひらがな/カタカナ/漢字/英字の切り替わり）でも分割し、単語候補を増やす
    const runs = chunk.match(SCRIPT_RUN_PATTERN) || [];
    for (const run of runs) {
      if (run.length >= 2 && run.length <= 12 && run !== chunk) {
        results.push({ term: run, isCompoundGuess: false });
      }
    }
  }
  // 隣接2チャンクの結合（例:「国産豚肉」+「切り落とし」→「国産豚肉切り落とし」）
  for (let i = 0; i < chunks.length - 1; i++) {
    const bigram = chunks[i] + chunks[i + 1];
    if (
      bigram.length >= 4 &&
      bigram.length <= 14 &&
      !isDuplicatedHalves(bigram) &&
      !looksLikeNumericNoise(bigram) &&
      !isLogisticsMarketingBigram(chunks[i], chunks[i + 1])
    ) {
      results.push({ term: bigram, isCompoundGuess: true });
    }
  }
  return results;
}

// ===== ⑥辞書カテゴリ分類（ヒューリスティック） =====
const KATAKANA_ONLY_PATTERN = /^[ァ-ヶー]+$/;
const VARIETY_SUFFIX_HINTS = ["はるか", "ホワイト", "スイート", "めざめ", "マスカット", "まどんな", "きらり"];

// カタカナ判定だけではブランド名と区別できない一般的な外来語・無関係語（ブラックリスト）。
// 気づいたものを追加していく想定（完全な網羅は目指さず、明らかな誤分類のみ除外する）。
const KATAKANA_BLOCKLIST = new Set([
  "アイス", "アイスクリーム", "アイスミルク", "アウトドア", "アグリバイオ", "アザラシ", "アリ",
  "アレンジ", "アンチエイジング", "エコ", "エコファーマー", "オンラインカタログ", "ヴィーガン",
  "オードブル", "オリジナル", "オリジナルブランド", "ガーリック", "セット", "サイズ", "タイプ",
  "パック", "シリーズ", "アソート", "ミネラル", "ビタミン", "カロリー", "レシピ",
  "ストック", "チェック", "ポイント", "サービス", "システム", "データ", "メニュー", "スタイル",
  "タイム", "スペース", "レベル", "ベース", "ケース", "コース", "プラン", "スタッフ", "メーカー",
  "クラス", "ランキング", "キャンペーン", "モニター", "サンプル", "シーズン", "トレンド",
]);

// ブランド・品種名として不自然に頻度が高すぎる（＝多くの無関係な商品に汎用的に登場する）候補は、
// 特定のブランド/品種名ではなく一般語である可能性が高いため除外し、一般食材名の判定に回す。
const BRAND_FREQUENCY_CEILING = 25;
const PROCESSED_FOOD_HINTS = [
  "焼売",
  "餃子",
  "カレー",
  "ハンバーグ",
  "ベーコン",
  "ソーセージ",
  "かまぼこ",
  "漬物",
  "味噌",
  "ジャム",
  "梅干し",
  "たたき",
  "干物",
  "もつ鍋",
  "煮",
  "焼き",
  "揚げ",
  "巻き",
];

function classify(
  term: string,
  frequency: number,
  isCompoundGuess: boolean,
  minFrequency: number,
  minCompoundFrequency: number
): DictionaryCategory | undefined {
  if (isCompoundGuess) {
    // 隣接チャンク結合による複合語候補は偶然の組み合わせも多いため、より高い頻度閾値を課す
    if (frequency < minCompoundFrequency) return undefined;
    if (term.length >= 6) return "compoundFoods";
  }
  if (frequency < minFrequency) return undefined;

  // ブロックリストに載っておらず、かつ「多くの無関係な商品に汎用的に登場する」ほど頻度が高すぎない
  // カタカナのみの語だけを、ブランド名として採用する（頻度が高すぎる語は一般語とみなす）
  if (
    KATAKANA_ONLY_PATTERN.test(term) &&
    !KATAKANA_BLOCKLIST.has(term) &&
    frequency <= BRAND_FREQUENCY_CEILING
  ) {
    return "brands";
  }
  if (VARIETY_SUFFIX_HINTS.some((hint) => term.includes(hint))) return "varieties";
  if (PROCESSED_FOOD_HINTS.some((hint) => term.includes(hint))) {
    // 長め（6文字以上）の加工食品系候補は「シリーズ名」寄りとして扱う
    // （例:「とまとたっぷりカレー」のような固有の商品ライン名を、一般名詞「カレー」と区別するため）
    return term.length >= 6 ? "series" : "processedFoods";
  }
  return "ingredients";
}

// ===== 重複除去（完全一致・大文字小文字・全角半角・ひらがなカタカナを考慮） =====
function dedupeKey(term: string): string {
  return term
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

interface CandidateStat {
  term: string; // 表示用の代表表記（最初に出現した形を採用）
  frequency: number; // 出現した商品数（ユニーク商品ベース）
  isCompoundGuess: boolean;
}

/**
 * 楽天APIの商品サンプル群から、辞書カテゴリ別のリストを自動生成する。
 * @param samples 商品情報（scripts/generateFoodDictionary.ts がRakuten APIから収集する）
 * @param minFrequency 何商品以上で出現した候補のみ採用するか（ノイズ語の混入を防ぐための閾値）
 * @param minCompoundFrequency 隣接チャンク結合による複合語候補に課す、より厳しい頻度閾値
 *   （偶然の単語の組み合わせが複合語として誤採用されるのを防ぐため）
 */
export function generateDictionary(
  samples: RakutenProductSample[],
  minFrequency = 3,
  minCompoundFrequency = 3
): DictionaryGenerationResult {
  const statsByKey = new Map<string, CandidateStat>();
  const unknown: UnknownProductRecord[] = [];
  let totalCandidatesBeforeDedupe = 0;

  for (const sample of samples) {
    const cleaned = removeNoise(sample.itemName);
    const bracketPhrases = extractBracketPhrases(sample.itemName).filter(
      (p) => !NOISE_PATTERNS.some((pattern) => new RegExp(pattern.source).test(p))
    );
    const chunkCandidates = extractCandidateTerms(cleaned);

    const candidateTerms = [
      ...bracketPhrases.map((term) => ({ term, isCompoundGuess: false })),
      ...chunkCandidates,
    ].filter(({ term }) => !isStopword(term));

    if (candidateTerms.length === 0) {
      unknown.push({
        itemCode: sample.itemCode,
        itemName: sample.itemName,
        displayName: cleaned || sample.itemName,
        reason: "不要キーワード除去後に候補語を抽出できなかった",
      });
      continue;
    }

    // 同一商品内での重複カウントを避けるため、商品ごとにユニーク化してから頻度に加算する
    const seenInThisProduct = new Set<string>();
    for (const { term, isCompoundGuess } of candidateTerms) {
      totalCandidatesBeforeDedupe++;
      const key = dedupeKey(term);
      if (seenInThisProduct.has(key)) continue;
      seenInThisProduct.add(key);

      const existing = statsByKey.get(key);
      if (existing) {
        existing.frequency++;
        existing.isCompoundGuess = existing.isCompoundGuess || isCompoundGuess;
      } else {
        statsByKey.set(key, { term, frequency: 1, isCompoundGuess });
      }
    }
  }

  const dictionary: GeneratedDictionary = {
    series: [],
    brands: [],
    varieties: [],
    compoundFoods: [],
    processedFoods: [],
    ingredients: [],
  };

  for (const stat of statsByKey.values()) {
    const category = classify(
      stat.term,
      stat.frequency,
      stat.isCompoundGuess,
      minFrequency,
      minCompoundFrequency
    );
    if (category) dictionary[category].push(stat.term);
  }

  // カテゴリごとに頻度降順で安定させるため、出現順のまま（Map挿入順=最初に見つかった順）を維持しつつ
  // 五十音・アルファベット順に整列して差分を追いやすくする
  for (const category of DICTIONARY_CATEGORIES) {
    dictionary[category] = [...new Set(dictionary[category])].sort((a, b) => a.localeCompare(b, "ja"));
  }

  const totalUniqueAfterDedupe = statsByKey.size;
  const totalAdoptedTerms = DICTIONARY_CATEGORIES.reduce((sum, c) => sum + dictionary[c].length, 0);
  const report: DictionaryGenerationReport = {
    categoryCounts: Object.fromEntries(
      DICTIONARY_CATEGORIES.map((c) => [c, dictionary[c].length])
    ) as Record<DictionaryCategory, number>,
    totalCandidatesBeforeDedupe,
    duplicatesRemoved: totalCandidatesBeforeDedupe - totalUniqueAfterDedupe,
    deletedByLowFrequency: totalUniqueAfterDedupe - totalAdoptedTerms,
    unmatchedProductCount: unknown.length,
  };

  return { dictionary, report, unknown };
}

// ===== 既知語によるシード補強 =====
// 自動生成は頻度・分類ヒューリスティックに依存するため、実運用上重要度の高い名称
// （地域ブランドや代表的な品種名など）が、たまたま頻度不足や誤分類で漏れることがある。
// 完全に手入力の辞書へ戻すのではなく、ごく少数の「確実に含めたい既知語」だけを
// 自動生成結果へ補強マージする（scripts/generateFoodDictionary.ts が生成直後に呼び出す）。
// 自動生成側の分類・閾値ロジックを改善するほど、ここへの依存度は下げられる。
export const SEED_TERMS: Partial<Record<DictionaryCategory, string[]>> = {
  series: ["とまとたっぷりカレー", "野菜ごろごろカレー", "北海道スープカレー", "黒豚焼売"],
  brands: [
    "ピュアホワイト",
    "紅はるか",
    "シルクスイート",
    "インカのめざめ",
    "あまおう",
    "シャインマスカット",
    "デコポン",
    "紅まどんな",
    "泉州たまねぎ",
  ],
  varieties: ["きたあかり", "男爵", "メークイン", "王林", "ふじ", "紅玉", "せとか", "甘平"],
  compoundFoods: ["国産豚肉切り落とし", "銀鮭切り身"],
};

/** 自動生成結果に、既知語シードを補強マージする（重複は五十音順ソートの過程で自然に除去される） */
export function mergeSeedTerms(dictionary: GeneratedDictionary): GeneratedDictionary {
  const merged = { ...dictionary };
  for (const category of DICTIONARY_CATEGORIES) {
    const seeds = SEED_TERMS[category] ?? [];
    merged[category] = [...new Set([...seeds, ...dictionary[category]])].sort((a, b) =>
      a.localeCompare(b, "ja")
    );
  }
  return merged;
}
