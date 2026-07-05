interface Props {
  value: string;
  label: string;
  icon?: string;
  tone?: "default" | "accent";
}

/** 大きな数値＋ラベルのカード（統計表示。食品ロス量、使える食材数など） */
export default function StatCard({ value, label, icon, tone = "default" }: Props) {
  return (
    <div className={`ds-stat-card ds-stat-card-${tone}`}>
      {icon && <span className="ds-stat-icon">{icon}</span>}
      <p className="ds-stat-value">{value}</p>
      <p className="ds-stat-label">{label}</p>
    </div>
  );
}
