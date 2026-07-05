import BackgroundImage from "./BackgroundImage";
import {
  FOOD_LOSS_RECIPE_BANNER_TITLE,
  FOOD_LOSS_RECIPE_BANNER_BODY,
  FOOD_LOSS_BANNER_CTA,
} from "../constants";

interface Props {
  onCtaClick: () => void;
}

/** レシピ回答ページ最下部の、食品ロス特設ページへの導線バナー（ヒーロー直下バナーより控えめ） */
export default function RecipeFooterBanner({ onCtaClick }: Props) {
  return (
    <BackgroundImage className="recipe-footer-banner">
      <h2 className="recipe-footer-banner-title">{FOOD_LOSS_RECIPE_BANNER_TITLE}</h2>
      <p className="recipe-footer-banner-body">{FOOD_LOSS_RECIPE_BANNER_BODY}</p>
      <button
        type="button"
        className="food-loss-banner-cta recipe-footer-banner-cta"
        onClick={onCtaClick}
      >
        {FOOD_LOSS_BANNER_CTA}
      </button>
    </BackgroundImage>
  );
}
