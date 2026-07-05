import type { ReactNode } from "react";

interface Props {
  title: string;
  lastUpdated: string;
  onBack: () => void;
  children: ReactNode;
}

/** プライバシーポリシー等、静的な規約ページ共通のレイアウト */
export default function PolicyPage({ title, lastUpdated, onBack, children }: Props) {
  return (
    <div className="policy-page">
      <a
        href="/"
        className="back"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
      >
        ← トップに戻る
      </a>
      <h1 className="policy-title">{title}</h1>
      <p className="policy-updated">最終更新日: {lastUpdated}</p>
      <div className="policy-body">{children}</div>
    </div>
  );
}
