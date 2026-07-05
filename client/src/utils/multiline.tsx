import type { ReactNode } from "react";

/** "\n"区切りの文字列を<br />付きのReactNode配列に変換する（食品ロス特設ページの複数行文言表示で使用） */
export function renderMultiline(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}
