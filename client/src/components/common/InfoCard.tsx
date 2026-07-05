interface Props {
  icon: string;
  title: string;
  body: string;
  tone?: "default" | "accent";
}

/** アイコン＋タイトル＋説明文の情報カード（「食品ロス削減につながる理由」等のグリッドで使用） */
export default function InfoCard({ icon, title, body, tone = "default" }: Props) {
  return (
    <div className={`ds-info-card ds-info-card-${tone}`}>
      <span className="ds-info-card-icon">{icon}</span>
      <p className="ds-info-card-title">{title}</p>
      <p className="ds-info-card-body">{body}</p>
    </div>
  );
}
