import { FOOD_LOSS_ICON } from "../constants";

interface Props {
  icon?: string;
  className?: string;
}

/** 食品ロス導線で使うアイコン。差し替え時はicon propsを渡すだけでよい */
export default function FoodLossIcon({ icon = FOOD_LOSS_ICON, className }: Props) {
  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}
