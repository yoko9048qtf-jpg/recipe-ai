/**
 * Fisher-Yates (Knuth) シャッフル。
 * 引数の配列は変更せず、シャッフル済みのコピーを返す。
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
export function fisherYatesShuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
