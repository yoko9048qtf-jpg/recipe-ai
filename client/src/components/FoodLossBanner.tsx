import { CtaBanner } from "./common";
import { IMAGE_ASSETS } from "../constants/imageAssets";
import { FOOD_LOSS_BANNER_TITLE, FOOD_LOSS_BANNER_CTA } from "../constants";

interface Props {
  onCtaClick: () => void;
}

/**
 * トップページ・ヒーロー直下の、食品ロス特設ページへの導線バナー。
 * バナー写真自体にタイトル・特徴・CTAがデザインされているため、
 * テキストを重ねず写真をそのまま活かし、画像全体をクリック領域にする。
 */
export default function FoodLossBanner({ onCtaClick }: Props) {
  return (
    <CtaBanner
      size="hero"
      title={FOOD_LOSS_BANNER_TITLE}
      ctaLabel={FOOD_LOSS_BANNER_CTA}
      onCtaClick={onCtaClick}
      image={IMAGE_ASSETS.foodLossBanner}
      imageContainsText
    />
  );
}
