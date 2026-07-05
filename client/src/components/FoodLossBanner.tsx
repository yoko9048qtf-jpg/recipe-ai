import BackgroundImage from "./BackgroundImage";
import { FOOD_LOSS_BANNER_TITLE, FOOD_LOSS_BANNER_BODY, FOOD_LOSS_BANNER_CTA } from "../constants";

interface Props {
  onCtaClick: () => void;
}

/** トップページ・ヒーロー直下の、食品ロス特設ページへの導線バナー */
export default function FoodLossBanner({ onCtaClick }: Props) {
  return (
    <BackgroundImage className="food-loss-banner">
      <h2 className="food-loss-banner-title">{FOOD_LOSS_BANNER_TITLE}</h2>
      <p className="food-loss-banner-body">{FOOD_LOSS_BANNER_BODY}</p>
      <button type="button" className="food-loss-banner-cta" onClick={onCtaClick}>
        {FOOD_LOSS_BANNER_CTA}
      </button>
    </BackgroundImage>
  );
}
