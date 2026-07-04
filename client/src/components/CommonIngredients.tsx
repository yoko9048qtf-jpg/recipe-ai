import { COMMON_INGREDIENTS } from "../commonIngredients";

interface Props {
  selected: Set<string>;
  onToggle: (name: string) => void;
}

export default function CommonIngredients({ selected, onToggle }: Props) {
  return (
    <div className="common-ingredients">
      {Object.entries(COMMON_INGREDIENTS).map(([category, items]) => (
        <div key={category} className="category">
          <h3 className="category-title">{category}</h3>
          <div className="chips">
            {items.map((name) => {
              const active = selected.has(name);
              return (
                <label key={name} className={`chip-check ${active ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onToggle(name)}
                  />
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
