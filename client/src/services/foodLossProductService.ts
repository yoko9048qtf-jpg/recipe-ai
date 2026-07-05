import type { FoodLossProduct, ProductFilterState } from "../types";

/**
 * ふるさと納税商品（食品ロス削減につながる商品）の取得。
 * server/app.js の `GET /api/food-loss-products` を呼び出す。サーバー側は楽天市場API
 * （server/rakutenIchiba.js）に接続済み。
 *
 * このファイルが「差し替え可能なサービス層」であり、呼び出し側（hooks/useFoodLossProducts.ts）は
 * 本関数のシグネチャ・返り値の型（Promise<FoodLossProduct[]>）にのみ依存しているため、
 * データ取得元を変更する場合もこのファイルの内部実装のみを変更すればよい。
 */
export async function fetchFoodLossProducts(
  filter: ProductFilterState
): Promise<FoodLossProduct[]> {
  const params = new URLSearchParams({ kind: filter.kind });
  if (filter.kind === "food-type") params.set("foodType", filter.foodType);
  if (filter.kind === "region") params.set("region", filter.region);
  if (filter.kind === "price") params.set("priceRange", filter.priceRange);

  const res = await fetch(`/api/food-loss-products?${params.toString()}`);
  if (!res.ok) {
    let message = `商品の取得に失敗しました (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const data = await res.json();
  return (data.products ?? []) as FoodLossProduct[];
}
