import { ImageWithFallback } from "./common";
import { IMAGE_ASSETS } from "../constants/imageAssets";
import { FOOD_LOSS_PAGE_TITLE } from "../constants";

/**
 * 食品ロス特設ページのヒーロー写真。トップページの<Hero />と同様に、
 * .app（中央寄せ・幅制限あり）の外側で描画することで画面横幅いっぱいに表示する。
 * 写真自体に見出し・統計がデザインされているため、テキストは重ねずトリミングもしない
 * （height:autoで写真全体をそのまま見せる）。
 */
export default function FoodLossHero() {
  return (
    <div className="fl-hero-fullbleed">
      <ImageWithFallback
        src={IMAGE_ASSETS.foodLossHero}
        alt={FOOD_LOSS_PAGE_TITLE}
        className="fl-hero-fullbleed-img"
        emoji="🥬"
      />
    </div>
  );
}
