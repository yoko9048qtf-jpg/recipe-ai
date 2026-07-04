import { COMMON_INGREDIENTS } from "../commonIngredients";

interface Props {
  selected: Set<string>;
  onToggle: (name: string) => void;
}

// 食材名 → アイコン（絵文字）。見た目のみの対応表で、一致しない食材は無地のまま表示する
const INGREDIENT_ICONS: Record<string, string> = {
  卵: "🥚",
  牛乳: "🥛",
  バター: "🧈",
  チーズ: "🧀",
  ヨーグルト: "🥣",
  生クリーム: "🍶",
  お米: "🍚",
  食パン: "🍞",
  パスタ: "🍝",
  うどん: "🍜",
  中華麺: "🍜",
  小麦粉: "🌾",
  たまねぎ: "🧅",
  じゃがいも: "🥔",
  にんじん: "🥕",
  キャベツ: "🥬",
  トマト: "🍅",
  きゅうり: "🥒",
  なす: "🍆",
  ピーマン: "🫑",
  ほうれん草: "🌿",
  にんにく: "🧄",
  しょうが: "🫚",
  長ねぎ: "🌱",
  鶏肉: "🐓",
  豚肉: "🐖",
  牛肉: "🥩",
  ひき肉: "🍖",
  ベーコン: "🥓",
  ウインナー: "🌭",
  鮭: "🐟",
  ツナ缶: "🥫",
};

export default function CommonIngredients({ selected, onToggle }: Props) {
  return (
    <div className="common-ingredients">
      {Object.entries(COMMON_INGREDIENTS).map(([category, items]) => (
        <div key={category} className="category">
          <h4 className="category-title">{category}</h4>
          <div className="chips">
            {items.map((name) => {
              const active = selected.has(name);
              const icon = INGREDIENT_ICONS[name];
              return (
                <label key={name} className={`chip-check ${active ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(name)}
                  />
                  {icon && <span className="chip-icon">{icon}</span>}
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
