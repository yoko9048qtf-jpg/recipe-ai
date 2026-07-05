import { useState } from "react";
import { formatProductName } from "../../utils/productNameFormatter";
import { hasProductImage, PRODUCT_IMAGE_PLACEHOLDER_TEXT } from "../../utils/productImage";
import { deriveProductBadges } from "../../utils/productBadges";
import { getFoodTypeSuggestions } from "../../utils/productSuggestions";
import { FOOD_LOSS_PAGE_CONTENT, FOOD_LOSS_REASON_CARDS } from "../../constants";
import { Modal, Badge, Button, InfoCard } from "../common";
import type { FoodLossProduct } from "../../types";

interface Props {
  product: FoodLossProduct;
  onClose: () => void;
}

/** 商品クリック時に表示する詳細モーダル。楽天市場APIから取得した商品情報を表示する。 */
export default function ProductModal({ product, onClose }: Props) {
  const [saved, setSaved] = useState(false);

  const targetUrl = product.affiliateUrl || product.itemUrl;
  const displayName = formatProductName(product.name);
  const badges = deriveProductBadges(product);
  const suggestions = getFoodTypeSuggestions(product.foodType);

  return (
    <Modal onClose={onClose} ariaLabel={displayName}>
      <div className="fl-modal-media">
        {hasProductImage(product.imageUrl) ? (
          <img src={product.imageUrl} alt={displayName} className="fl-modal-photo" />
        ) : (
          <div
            className="fl-modal-photo fl-image-placeholder"
            role="img"
            aria-label={PRODUCT_IMAGE_PLACEHOLDER_TEXT}
          >
            <span>{PRODUCT_IMAGE_PLACEHOLDER_TEXT}</span>
          </div>
        )}
        <div className="fl-modal-badges">
          {badges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>
      </div>

      <h3 className="fl-modal-name">{displayName}</h3>

      <dl className="fl-modal-meta">
        <div className="fl-modal-meta-row">
          <dt>📍 自治体</dt>
          <dd>{product.municipality}</dd>
        </div>
        <div className="fl-modal-meta-row">
          <dt>📦 内容量</dt>
          <dd>{product.quantity || FOOD_LOSS_PAGE_CONTENT.section3.quantityFallback}</dd>
        </div>
        <div className="fl-modal-meta-row">
          <dt>寄付金額</dt>
          <dd>{product.donationAmount.toLocaleString()}円</dd>
        </div>
      </dl>

      <div className="fl-modal-insight">
        <p className="fl-modal-insight-label">✨ おすすめポイント</p>
        <p className="fl-modal-insight-text">{product.aiInsight}</p>
      </div>

      <div className="fl-modal-block">
        <p className="fl-modal-block-title">🌱 食品ロス削減につながる理由</p>
        <div className="fl-modal-reason-grid">
          {FOOD_LOSS_REASON_CARDS.map((reason) => (
            <InfoCard key={reason.title} icon={reason.icon} title={reason.title} body={reason.body} />
          ))}
        </div>
      </div>

      <div className="fl-modal-block">
        <p className="fl-modal-block-title">🍽️ おすすめの食べ方</p>
        <div className="fl-modal-suggestions">
          {suggestions.map((s) => (
            <span key={s} className="fl-modal-suggestion-chip">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="fl-modal-actions">
        {targetUrl ? (
          <Button
            as="a"
            variant="primary"
            size="lg"
            fullWidth
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
          >
            {FOOD_LOSS_PAGE_CONTENT.section3.productCta}
          </Button>
        ) : (
          // URLが取得できなかった場合のフォールバック（本来は発生しない想定）
          <Button variant="primary" size="lg" fullWidth disabled>
            {FOOD_LOSS_PAGE_CONTENT.section3.productCta}
          </Button>
        )}
        <div className="fl-modal-actions-sub">
          <Button variant="secondary" fullWidth onClick={() => setSaved((v) => !v)}>
            {saved ? "♥ 保存済み" : "♡ あとで見る"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>
    </Modal>
  );
}
