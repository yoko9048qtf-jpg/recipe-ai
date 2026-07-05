interface Props {
  icon: string;
  title: string;
  body?: string;
}

/** アイコン付きの特徴カード（トップページの3特徴、おすすめの食べ方などに使う小型カード） */
export default function FeatureCard({ icon, title, body }: Props) {
  return (
    <div className="ds-feature-card">
      <span className="ds-feature-icon">{icon}</span>
      <p className="ds-feature-title">{title}</p>
      {body && <p className="ds-feature-body">{body}</p>}
    </div>
  );
}
