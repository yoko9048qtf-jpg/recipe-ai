import { formatProductName } from "../../utils/productNameFormatter";
import { hasProductImage, PRODUCT_IMAGE_PLACEHOLDER_TEXT } from "../../utils/productImage";
import { deriveProductBadges } from "../../utils/productBadges";
import { Badge } from "../common";
import type { FoodLossProduct } from "../../types";

interface Props {
  product: FoodLossProduct;
  onClick: (product: FoodLossProduct) => void;
}

/**
 * 商品一覧カード。商品写真・バッジ・商品名（1行目）・自治体名（2行目、📍付き）を表示する
 * （価格・ロス削減説明は表示しない。詳細はクリック後のモーダルで表示する）。
 * 画像は正方形（aspect-ratio 1:1）・商品名は2行までのクランプ表示に統一し、
 * カード高さが商品ごとにばらつかないようにしている。
 */
export default function ProductCard({ product, onClick }: Props) {
  const displayName = formatProductName(product.name);
  const badges = deriveProductBadges(product);

  return (
    <button type="button" className="fl-product-card" onClick={() => onClick(product)}>
      <div className="fl-product-media">
        {hasProductImage(product.imageUrl) ? (
          <img src={product.imageUrl} alt={displayName} className="fl-product-photo" />
        ) : (
          <div
            className="fl-product-photo fl-image-placeholder"
            role="img"
            aria-label={PRODUCT_IMAGE_PLACEHOLDER_TEXT}
          >
            <span>{PRODUCT_IMAGE_PLACEHOLDER_TEXT}</span>
          </div>
        )}
        <div className="fl-product-badges">
          {badges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>
      </div>
      <p className="fl-product-name">{displayName}</p>
      <p className="fl-product-municipality">📍 {product.municipality}</p>
    </button>
  );
}
