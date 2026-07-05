import { useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}

/** 中央配置のモーダル共通ラッパー（オーバーレイクリック・Escで閉じる）。 */
export default function Modal({ onClose, ariaLabel, children }: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="ds-modal-overlay" onClick={onClose}>
      <div
        className="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ds-modal-close" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
