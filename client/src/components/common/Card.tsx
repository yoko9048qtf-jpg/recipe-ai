import type { ReactNode, HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  as?: "div" | "button";
}

/** 情報カードの共通スタイル（白背景・統一角丸・柔らかい影）。 */
export default function Card({
  children,
  padding = "md",
  interactive = false,
  as = "div",
  className,
  ...rest
}: Props) {
  const cls = [
    "ds-card",
    `ds-card-pad-${padding}`,
    interactive ? "ds-card-interactive" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  if (as === "button") {
    return (
      <button type="button" className={cls} {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
