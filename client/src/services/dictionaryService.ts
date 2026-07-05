// 商品名抽出辞書（client/src/data/food-dictionary/*.json）のランタイムローダー。
// JSONはビルド時にバンドルへ含まれ、モジュール初期化時（起動時）に一度だけ読み込まれてメモリに保持される
// （以降の呼び出しはすべて同じオブジェクトを参照するだけで、再読み込みは発生しない）。
//
// 辞書の中身を更新したい場合は scripts/generateFoodDictionary.ts を再実行して
// client/src/data/food-dictionary/*.json を再生成する（本ファイルの変更は不要）。

import seriesData from "../data/food-dictionary/series.json";
import brandsData from "../data/food-dictionary/brands.json";
import varietiesData from "../data/food-dictionary/varieties.json";
import compoundFoodsData from "../data/food-dictionary/compound-foods.json";
import processedFoodsData from "../data/food-dictionary/processed-foods.json";
import ingredientsData from "../data/food-dictionary/ingredients.json";
import type { DictionaryCategory, GeneratedDictionary } from "./dictionaryGeneratorService";

// 商品名抽出時に辞書を参照する優先順位（series → brands → varieties → compoundFoods →
// processedFoods → ingredients、この後にルールベース抽出・フォールバックへ続く）
export const DICTIONARY_LOOKUP_ORDER: DictionaryCategory[] = [
  "series",
  "brands",
  "varieties",
  "compoundFoods",
  "processedFoods",
  "ingredients",
];

/** 起動時に一度だけ読み込まれ、以降はこのオブジェクトがメモリ上でキャッシュとして使われる */
export const foodDictionary: GeneratedDictionary = {
  series: seriesData as string[],
  brands: brandsData as string[],
  varieties: varietiesData as string[],
  compoundFoods: compoundFoodsData as string[],
  processedFoods: processedFoodsData as string[],
  ingredients: ingredientsData as string[],
};
