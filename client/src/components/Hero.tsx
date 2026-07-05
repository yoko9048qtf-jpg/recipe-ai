export default function Hero() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: "url(/assets/images/hero.png)" }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">
          今日の夕飯、
          <br />
          <span className="hero-accent">もう迷わない</span>
        </h1>
        <p className="hero-subtitle">
          冷蔵庫にある食材から、
          <br />
          今日のレシピを提案します
        </p>
        <p className="hero-subtitle hero-subtitle-strong">食品ロスを無くしましょう！</p>
      </div>
    </section>
  );
}
