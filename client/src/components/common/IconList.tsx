interface Item {
  icon?: string;
  text: string;
}

interface Props {
  items: Item[];
  defaultIcon?: string;
}

/** アイコン付き箇条書きリスト（ふるさと納税の理由、ロス削減の理由などで共通利用） */
export default function IconList({ items, defaultIcon = "🌱" }: Props) {
  return (
    <ul className="ds-icon-list">
      {items.map((item) => (
        <li key={item.text}>
          <span className="ds-icon-list-icon">{item.icon ?? defaultIcon}</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
