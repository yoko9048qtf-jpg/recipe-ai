import { useState } from "react";
import ProductFilter from "./ProductFilter";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useFoodLossProducts } from "../../hooks/useFoodLossProducts";
import { SectionHeader, ImageWithFallback, InfoCard } from "../common";
import { IMAGE_ASSETS } from "../../constants/imageAssets";
import { FOOD_LOSS_PAGE_CONTENT, FOOD_LOSS_REASON_CARDS } from "../../constants";
import type { FoodLossProduct, ProductFilterState } from "../../types";

const { section3 } = FOOD_LOSS_PAGE_CONTENT;

const INITIAL_FILTER: ProductFilterState = {
  kind: "food-type",
  foodType: "vegetable",
  region: "kanto",
  priceRange: "under-5000",
};

/** SECTION3: 「食品ロスを減らす商品を探す」（説明カード＋フィルター＋商品一覧＋詳細モーダル） */
export default function ProductSection() {
  const [filter, setFilter] = useState<ProductFilterState>(INITIAL_FILTER);
  const [selected, setSelected] = useState<FoodLossProduct | null>(null);
  const { products, loading, error } = useFoodLossProducts(filter);

  return (
    <section className="fl-section" id="fl-products">
      <SectionHeader title={section3.title} subtitle={section3.subtitle} />

      <div className="fl-card fl-explain-card">
        <ImageWithFallback
          src={IMAGE_ASSETS.furusatoFoods}
          alt="ふるさと納税の返礼品イメージ"
          className="fl-explain-photo"
          emoji="🎁"
        />
        <h3 className="fl-subsection-title fl-explain-heading">{section3.explainTitle}</h3>
        <div className="fl-reason-grid">
          {FOOD_LOSS_REASON_CARDS.map((reason) => (
            <InfoCard key={reason.title} icon={reason.icon} title={reason.title} body={reason.body} />
          ))}
        </div>
      </div>

      <ProductFilter filter={filter} onChange={setFilter} />

      {error && <div className="banner-error">{error}</div>}

      <h3 className="fl-products-heading">🛍️ 全国の返礼品から探す</h3>

      {loading ? (
        <p className="loading">商品を探しています…</p>
      ) : (
        !error && (
          <div className="fl-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={setSelected} />
            ))}
            {products.length === 0 && (
              <p className="fl-product-empty">条件に合う商品が見つかりませんでした。</p>
            )}
          </div>
        )
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
