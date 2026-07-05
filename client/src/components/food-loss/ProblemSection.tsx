import SectionDivider from "./SectionDivider";
import { SectionHeader, StatCard, ImageWithFallback } from "../common";
import { IMAGE_ASSETS } from "../../constants/imageAssets";
import { FOOD_LOSS_PAGE_CONTENT } from "../../constants";

const { section1 } = FOOD_LOSS_PAGE_CONTENT;

/** SECTION1: 「食品ロスってどんな問題？」 */
export default function ProblemSection() {
  return (
    <section className="fl-section">
      <SectionHeader title={section1.title} subtitle={section1.subtitle} />

      <div className="fl-card fl-impact-card">
        <ImageWithFallback
          src={IMAGE_ASSETS.vegetables}
          alt="食品ロスのイメージ写真"
          className="fl-impact-photo"
          emoji="🗑️"
        />
        <div className="fl-impact-stats">
          <StatCard value={section1.impactJapan.value} label={section1.impactJapan.label} />
          <StatCard value={section1.impactWorld.value} label={section1.impactWorld.label} />
        </div>
      </div>

      <h3 className="fl-subsection-title">{section1.householdTitle}</h3>
      <div className="fl-household-split">
        <div className="fl-household-card fl-household-home">
          <span className="fl-household-emoji">{section1.household.emoji}</span>
          <p className="fl-household-label">{section1.household.label}</p>
          <p className="fl-household-percent">{section1.household.percent}</p>
          <ul className="fl-household-reasons">
            {section1.household.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div className="fl-household-card fl-household-business">
          <span className="fl-household-emoji">{section1.business.emoji}</span>
          <p className="fl-household-label">{section1.business.label}</p>
          <p className="fl-household-percent">{section1.business.percent}</p>
        </div>
      </div>

      <SectionDivider text={section1.transition} />
    </section>
  );
}
