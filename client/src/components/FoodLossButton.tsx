import FoodLossIcon from "./FoodLossIcon";

interface Props {
  icon: string;
  label: string;
  onClick: () => void;
}

/**
 * ヘッダー右側に常時表示する、食品ロス特設ページへの導線ボタン。
 * 「アイコン＋ラベル」のセットが必須（ラベルの省略・アイコン単体表示は不可）。
 * icon/labelは呼び出し側（Header.tsx）からconstants.tsの値を渡す必須propsとし、
 * 文言・アイコンの差し替えがconstants.tsの変更のみで完結するようにしている。
 */
export default function FoodLossButton({ icon, label, onClick }: Props) {
  return (
    <button type="button" className="food-loss-btn" onClick={onClick} aria-label={label}>
      <FoodLossIcon icon={icon} className="food-loss-btn-icon" />
      <span className="food-loss-btn-label">{label}</span>
    </button>
  );
}
