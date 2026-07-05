import { renderMultiline } from "../../utils/multiline";

interface Props {
  text: string;
}

/** セクション間をつなぐ一文（食品ロス特設ページ専用） */
export default function SectionDivider({ text }: Props) {
  return <p className="fl-section-divider">{renderMultiline(text)}</p>;
}
