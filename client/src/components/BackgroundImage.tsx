import type { ReactNode } from "react";

interface Props {
  className: string;
  image?: string;
  children: ReactNode;
}

/**
 * 写真背景＋グリーン系オーバーレイの共通構造。
 * imageを渡さない場合はCSS側のグラデーションを仮背景として使う（写真アセット未用意の間の暫定表示）。
 * 実写真が用意でき次第、client/public/assets/images に配置しimage propsでパスを渡すだけで差し替えられる。
 */
export default function BackgroundImage({ className, image, children }: Props) {
  return (
    <section
      className={className}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="bg-image-overlay" />
      <div className="bg-image-content">{children}</div>
    </section>
  );
}
