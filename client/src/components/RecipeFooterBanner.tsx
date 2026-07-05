import { CtaBanner } from "./common";
import {
  FOOD_LOSS_RECIPE_BANNER_TITLE,
  FOOD_LOSS_RECIPE_BANNER_BODY,
  FOOD_LOSS_BANNER_CTA,
} from "../constants";

interface Props {
  onCtaClick: () => void;
}

/** レシピ回答ページ最下部の、食品ロス特設ページへの導線バナー（コンパクト表示） */
export default function RecipeFooterBanner({ onCtaClick }: Props) {
  return (
    <CtaBanner
      size="compact"
      title={FOOD_LOSS_RECIPE_BANNER_TITLE}
      body={FOOD_LOSS_RECIPE_BANNER_BODY}
      ctaLabel={FOOD_LOSS_BANNER_CTA}
      onCtaClick={onCtaClick}
    />
  );
}
