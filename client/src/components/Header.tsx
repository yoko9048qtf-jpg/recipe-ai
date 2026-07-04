interface Props {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: Props) {
  return (
    <header className="site-header">
      <button
        type="button"
        className="brand-btn"
        onClick={onLogoClick}
        aria-label="ホームに戻る"
      >
        <img src="/assets/images/icon.png" alt="" className="brand-logo" />
        <span className="brand-name">
          <span className="brand-line">Sustainable</span>
          <span className="brand-line">Recipe Maker</span>
        </span>
      </button>
    </header>
  );
}
