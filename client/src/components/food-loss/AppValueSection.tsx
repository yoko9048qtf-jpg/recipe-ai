import SectionDivider from "./SectionDivider";
import { SectionHeader } from "../common";
import { FOOD_LOSS_PAGE_CONTENT } from "../../constants";
import { renderMultiline } from "../../utils/multiline";

const { section2 } = FOOD_LOSS_PAGE_CONTENT;

/** SECTION2: 「このアプリでできること」 */
export default function AppValueSection() {
  return (
    <section className="fl-section">
      <SectionHeader title={section2.title} subtitle={section2.subtitle} />

      <div className="fl-card fl-flow-card">
        <div className="fl-flow-ingredients">
          {section2.flow.ingredients.map((item) => (
            <span key={item} className="fl-flow-chip">
              {item}
            </span>
          ))}
        </div>
        <div className="fl-flow-arrow" aria-hidden="true">
          ↓
        </div>
        <div className="fl-flow-result">{section2.flow.result}</div>
        <p className="fl-flow-caption">{section2.flow.caption}</p>
      </div>

      <div className="fl-card fl-assist-card">
        <h3 className="fl-subsection-title">{section2.assistTitle}</h3>
        <p className="fl-assist-body">{renderMultiline(section2.assistBody)}</p>
      </div>

      <SectionDivider text={section2.transition} />
    </section>
  );
}
