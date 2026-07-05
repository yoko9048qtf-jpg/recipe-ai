import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
}

/** 各セクション冒頭の見出し（アイキャッチ小見出し＋タイトル＋補足文）を統一する。 */
export default function SectionHeader({ eyebrow, title, subtitle, align = "left" }: Props) {
  return (
    <div className={`ds-section-header ds-align-${align}`}>
      {eyebrow && <p className="ds-section-eyebrow">{eyebrow}</p>}
      <h2 className="ds-section-title">{title}</h2>
      {subtitle && <p className="ds-section-subtitle">{subtitle}</p>}
    </div>
  );
}
