import { POLICY_LABELS, POLICY_PATHS, SERVICE_NAME } from "../constants";
import type { PolicyView } from "../types";

interface Props {
  onNavigate: (view: PolicyView) => void;
}

const POLICY_VIEWS = Object.keys(POLICY_PATHS) as PolicyView[];

export default function Footer({ onNavigate }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, view: PolicyView) {
    // 中クリック・Ctrl/Cmdクリック等（新規タブで開く操作）は通常のリンク遷移に任せる
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(view);
  }

  return (
    <footer className="app-footer">
      <nav className="footer-links" aria-label="ポリシーページ">
        {POLICY_VIEWS.map((view) => (
          <a key={view} href={POLICY_PATHS[view]} onClick={(e) => handleClick(e, view)}>
            {POLICY_LABELS[view]}
          </a>
        ))}
      </nav>
      <p className="footer-credit">
        レシピ情報提供: 楽天レシピ ／ 食材認識・レシピ生成の一部にAI（Anthropic Claude）を利用
      </p>
      <p className="footer-copyright">© 2026 {SERVICE_NAME}</p>
    </footer>
  );
}
