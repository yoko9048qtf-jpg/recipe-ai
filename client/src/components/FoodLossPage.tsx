import FoodLossIcon from "./FoodLossIcon";
import { FOOD_LOSS_PAGE_TITLE, FOOD_LOSS_COMING_SOON_TEXT } from "../constants";

interface Props {
  onBack: () => void;
}

/**
 * 食品ロス特設ページ（Coming Soon）。
 * 現時点では未実装のため準備中表示のみ。将来、楽天ふるさと納税・食品ロス特集ページ等の
 * 内容に差し替える前提で、ルーティング（/food-loss）とこのページ自体は残しておく。
 */
export default function FoodLossPage({ onBack }: Props) {
  return (
    <div className="policy-page food-loss-page">
      <a
        href="/"
        className="back"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
      >
        ← トップに戻る
      </a>
      <h1 className="policy-title">{FOOD_LOSS_PAGE_TITLE}</h1>
      <div className="food-loss-coming-soon">
        <FoodLossIcon className="food-loss-coming-soon-icon" />
        <p>{FOOD_LOSS_COMING_SOON_TEXT}</p>
      </div>
    </div>
  );
}
