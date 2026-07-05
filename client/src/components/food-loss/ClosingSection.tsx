import { Button } from "../common";
import { FOOD_LOSS_PAGE_CONTENT } from "../../constants";
import { renderMultiline } from "../../utils/multiline";

const { closing } = FOOD_LOSS_PAGE_CONTENT;

/** ページ最下部の締めのメッセージ＋商品一覧へのCTA */
export default function ClosingSection() {
  return (
    <section className="fl-closing">
      <h2 className="fl-closing-title">{renderMultiline(closing.title)}</h2>
      <p className="fl-closing-body">{renderMultiline(closing.body)}</p>
      <Button as="a" variant="primary" size="lg" href="#fl-products">
        食品ロス削減の返礼品をもっと見る →
      </Button>
    </section>
  );
}
