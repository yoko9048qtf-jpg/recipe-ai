import type { ReactNode } from "react";

export type BadgeTone = "bargain" | "popular" | "limited" | "local" | "special" | "neutral";

interface Props {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** ルールベースで生成する商品バッジ・レシピバッジ共通の見た目（丸ピル） */
export default function Badge({ tone = "neutral", icon, children, className }: Props) {
  return (
    <span className={["ds-badge", `ds-badge-${tone}`, className || ""].filter(Boolean).join(" ")}>
      {icon && <span className="ds-badge-icon">{icon}</span>}
      {children}
    </span>
  );
}
