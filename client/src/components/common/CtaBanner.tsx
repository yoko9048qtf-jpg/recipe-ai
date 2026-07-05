import type { ReactNode } from "react";
import ImageWithFallback from "./ImageWithFallback";
import Button from "./Button";

interface FeatureItem {
  icon: string;
  label: string;
}

interface Props {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  features?: FeatureItem[];
  ctaLabel: string;
  onCtaClick: () => void;
  image?: string;
  className?: string;
  size?: "hero" | "compact";
  /**
   * true の場合、画像自体にタイトル・CTA等がすでにデザインされている前提で、
   * テキストを重ねずに写真をそのまま活かす（画像全体をクリック領域にする）。
   * バナー写真にタイトル文字やボタンが焼き込まれている場合に使用する。
   */
  imageContainsText?: boolean;
}

/**
 * リッチな「食品ロス特集」導線バナー。トップページ（size="hero"）・
 * レシピ回答ページ下部（size="compact"）の両方で共通利用する。
 */
export default function CtaBanner({
  eyebrow,
  title,
  body,
  features,
  ctaLabel,
  onCtaClick,
  image,
  className,
  size = "hero",
  imageContainsText = false,
}: Props) {
  if (imageContainsText && image) {
    return (
      <button
        type="button"
        className={`ds-cta-banner-photo ${className || ""}`}
        onClick={onCtaClick}
        aria-label={typeof title === "string" ? `${title}（${ctaLabel}）` : ctaLabel}
      >
        <ImageWithFallback src={image} alt="" className="ds-cta-banner-photo-img" emoji="🥬" />
      </button>
    );
  }

  return (
    <section className={`ds-cta-banner ds-cta-banner-${size} ${className || ""}`}>
      <div className="ds-cta-banner-text">
        {eyebrow && <span className="ds-cta-banner-eyebrow">{eyebrow}</span>}
        <h2 className="ds-cta-banner-title">{title}</h2>
        {body && <p className="ds-cta-banner-body">{body}</p>}
        {features && features.length > 0 && (
          <div className="ds-cta-banner-features">
            {features.map((f) => (
              <div key={f.label} className="ds-cta-banner-feature">
                <span className="ds-cta-banner-feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        )}
        <Button variant="primary" size={size === "hero" ? "lg" : "md"} onClick={onCtaClick}>
          {ctaLabel} →
        </Button>
      </div>
      {image && (
        <div className="ds-cta-banner-image">
          <ImageWithFallback src={image} alt="" className="ds-cta-banner-img" emoji="🥬" />
        </div>
      )}
    </section>
  );
}
