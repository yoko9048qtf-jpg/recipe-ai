import FoodLossButton from "./FoodLossButton";
import { FOOD_LOSS_ICON, FOOD_LOSS_HEADER_LABEL } from "../constants";

interface Props {
  onLogoClick: () => void;
  onFoodLossClick: () => void;
}

export default function Header({ onLogoClick, onFoodLossClick }: Props) {
  return (
    <header className="site-header">
      <button
        type="button"
        className="brand-btn"
        onClick={onLogoClick}
        aria-label="ホームに戻る"
      >
        <img src="/assets/images/icon.png" alt="" className="brand-logo" />
        <span className="brand-name">
          <span className="brand-line">Sustainable</span>
          <span className="brand-line">Recipe Maker</span>
        </span>
      </button>
      <FoodLossButton
        icon={FOOD_LOSS_ICON}
        label={FOOD_LOSS_HEADER_LABEL}
        onClick={onFoodLossClick}
      />
    </header>
  );
}
