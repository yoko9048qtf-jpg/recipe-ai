import ProblemSection from "./food-loss/ProblemSection";
import AppValueSection from "./food-loss/AppValueSection";
import ProductSection from "./food-loss/ProductSection";
import ClosingSection from "./food-loss/ClosingSection";
import { FOOD_LOSS_PAGE_TITLE } from "../constants";

interface Props {
  onBack: () => void;
}

/**
 * 食品ロス特設ページ（/food-loss）。
 * ヘッダー右上ボタン・トップページ直下バナー・レシピ回答ページ下部バナーの3箇所から遷移する。
 * ヒーロー写真（画面横幅いっぱい）は App.tsx で <FoodLossHero /> として別途描画している
 * （トップページの <Hero /> と同じ構造）。
 */
export default function FoodLossPage({ onBack }: Props) {
  return (
    <div className="fl-page">
      <a
        href="/"
        className="back"
        onClick={(e) => {
          e.preventDefault();
          onBack();
        }}
      >
        ← トップに戻る
      </a>

      {/* 写真自体に見出し・統計・特徴がデザインされているため、テキストは重ねずそのまま活かす。
          h1はページ構造上必要なため、視覚的には隠しつつ残す（スクリーンリーダー用） */}
      <h1 className="sr-only">{FOOD_LOSS_PAGE_TITLE}</h1>

      <ProblemSection />
      <AppValueSection />
      <ProductSection />
      <ClosingSection />
    </div>
  );
}
