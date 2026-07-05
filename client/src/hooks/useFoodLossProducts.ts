import { useEffect, useState } from "react";
import type { FoodLossProduct, ProductFilterState } from "../types";
import { fetchFoodLossProducts } from "../services/foodLossProductService";

/**
 * フィルター条件に応じたふるさと納税商品一覧を取得するフック。
 * データ取得の実体は services/foodLossProductService.ts に委譲しており、
 * データ取得元を変えてもこのフックの使い方（products/loading/error）は変わらない想定。
 */
export function useFoodLossProducts(filter: ProductFilterState) {
  const [products, setProducts] = useState<FoodLossProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchFoodLossProducts(filter)
      .then((data) => {
        if (!active) return;
        setProducts(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "商品の取得に失敗しました");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter.kind, filter.foodType, filter.region, filter.priceRange]);

  return { products, loading, error };
}
