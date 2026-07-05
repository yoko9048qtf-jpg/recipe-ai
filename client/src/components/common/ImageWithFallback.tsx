import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  emoji?: string;
}

/**
 * 画像未配置でもレイアウトが崩れないようにするための共通<img>ラッパー。
 * 読み込みに失敗した場合はCSSグラデーションのプレースホルダー（.ds-image-fallback）に切り替える。
 * 画像が用意でき次第、呼び出し側のsrcを差し替えるだけでよい。
 */
export default function ImageWithFallback({ src, alt, className, emoji = "🌿" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`ds-image-fallback ${className || ""}`} role="img" aria-label={alt}>
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
