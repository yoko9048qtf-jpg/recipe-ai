import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "line";
type Size = "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };

/**
 * デザインシステム共通ボタン。CTAは緑（primary）で統一する。
 * as="a" を渡すとリンクとして描画する（外部遷移用）。
 */
export default function Button(props: ButtonProps | AnchorProps) {
  const { variant = "primary", size = "md", fullWidth, icon, children, className, ...rest } = props;
  const cls = [
    "ds-btn",
    `ds-btn-${variant}`,
    `ds-btn-${size}`,
    fullWidth ? "ds-btn-full" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.as === "a") {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={cls} {...anchorRest}>
        {icon && <span className="ds-btn-icon">{icon}</span>}
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={cls} {...buttonRest}>
      {icon && <span className="ds-btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
