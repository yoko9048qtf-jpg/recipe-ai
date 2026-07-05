import { useEffect, useRef, useState } from "react";
import type { Recipe, DetailIngredient } from "../types";
import { fetchRecipeDetail } from "../api";
import RecipeFooterBanner from "./RecipeFooterBanner";
import { Button, Badge } from "./common";
import { guessCategoryLabel } from "../utils/recipeDisplayMeta";

interface Props {
  detail: Recipe;
  servings: number;
  have: string[];
  relatedRecipes: Recipe[];
  onBack: () => void;
  onSelectRelated: (recipe: Recipe) => void;
  onFoodLossClick: () => void;
}

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function RecipeDetailView({
  detail,
  servings,
  have,
  relatedRecipes,
  onBack,
  onSelectRelated,
  onFoodLossClick,
}: Props) {
  const [ingredients, setIngredients] = useState<DetailIngredient[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedShopping, setCheckedShopping] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

  function toggleShoppingItem(key: string) {
    setCheckedShopping((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const related = relatedRecipes.filter((r) => r.id !== detail.id).slice(0, 3);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setIngredients([]);
    setSteps([]);
    setCheckedShopping(new Set());
    fetchRecipeDetail(detail.title, detail.materials, servings, have)
      .then((data) => {
        if (!active) return;
        setIngredients(data.ingredients);
        setSteps(data.steps);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "レシピの生成に失敗しました");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [detail.id, detail.title, servings]);

  const missing = ingredients.filter((i) => i.missing);
  const ready = !loading && !error && ingredients.length > 0;

  function safeFileName() {
    const name = (detail.title || "recipe").replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 50);
    return name || "recipe";
  }

  function pdfOptions() {
    return {
      margin: 10,
      filename: `${safeFileName()}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // 画像(クロスオリジン)はPDF化対象から除外（canvas汚染による失敗を防ぐ）
        ignoreElements: (el: Element) =>
          (el as HTMLElement).classList?.contains?.("no-pdf") ?? false,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
  }

  // html2pdf.js は重いので、ボタン押下時に動的 import（初期ロードを軽くする）。
  async function loadHtml2pdf() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await import("html2pdf.js")).default as unknown as () => any;
  }

  async function handlePdf() {
    if (!ready || !printRef.current) return;
    setError("");
    // ポップアップブロック回避のため、クリック直後に空タブを開いておく
    const win = window.open("", "_blank");
    try {
      const html2pdf = await loadHtml2pdf();
      // PDFをBlob化してブラウザのビューアで表示（ダウンロードはしない）
      const blob: Blob = await html2pdf()
        .set(pdfOptions())
        .from(printRef.current)
        .outputPdf("blob");
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
      // メモリ解放（表示後しばらくしてから）
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      if (win) win.close();
      console.error("[pdf]", e);
      setError("PDFの表示に失敗しました。");
    }
  }

  function buildShareText() {
    const lines: string[] = [];
    lines.push(`【${detail.title}】（${servings}人分）`);
    lines.push("");
    lines.push("■ 材料");
    ingredients.forEach((i) =>
      lines.push(`・${i.name} ${i.amount}${i.missing ? "（不足）" : ""}`)
    );
    if (missing.length > 0) {
      lines.push("");
      lines.push("■ 買い物リスト（不足）");
      missing.forEach((i) => lines.push(`・${i.name} ${i.amount}`));
    }
    lines.push("");
    lines.push("■ 作り方");
    steps.forEach((s, idx) => lines.push(`${idx + 1}. ${s}`));
    lines.push("");
    lines.push(`出典: 楽天レシピ ${detail.url}`);
    lines.push("（AI×レシピメーカー）");
    return lines.join("\n");
  }

  async function handleLine() {
    if (!ready) return;
    const text = buildShareText();
    // モバイル等で「ファイル共有」に対応していれば、PDFをそのままLINE等へ共有
    try {
      const nav = navigator as Navigator & {
        canShare?: (data?: unknown) => boolean;
        share?: (data?: unknown) => Promise<void>;
      };
      if (printRef.current && nav.canShare && nav.share) {
        const html2pdf = await loadHtml2pdf();
        const blob: Blob = await html2pdf()
          .set(pdfOptions())
          .from(printRef.current)
          .outputPdf("blob");
        const file = new File([blob], `${safeFileName()}.pdf`, { type: "application/pdf" });
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], title: detail.title, text });
          return;
        }
      }
    } catch {
      // 共有がキャンセル/非対応 → テキスト共有にフォールバック
    }
    // フォールバック: LINEのテキスト共有（PC含め確実に動く）
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="recipe-detail">
      <button type="button" className="back" onClick={onBack}>
        ← 一覧に戻る
      </button>

      <div ref={printRef} className="recipe-printable">
        <div className="recipe-hero">
          {detail.image ? (
            <img
              className="recipe-hero-img no-pdf"
              src={detail.image}
              alt={detail.title}
              onError={hideOnError}
            />
          ) : (
            <div className="ds-image-fallback recipe-hero-img no-pdf" role="img" aria-label={detail.title}>
              <span>🍳</span>
            </div>
          )}
          <div className="recipe-hero-meta-overlay no-pdf">
            <span className="recipe-hero-chip">🍽 {servings}人分</span>
            {detail.indication ? <span className="recipe-hero-chip">⏱ {detail.indication}</span> : null}
            {detail.cost ? <span className="recipe-hero-chip">💰 {detail.cost}</span> : null}
          </div>
        </div>

        <div className="recipe-detail-heading">
          <Badge tone="neutral">{guessCategoryLabel(detail.title)}</Badge>
          <h1>{detail.title}</h1>
        </div>

        {loading && <p className="loading">{servings}人分のレシピを作成しています…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            <section>
              <h2>必要な材料（{servings}人分）</h2>
              <ul className="ingredient-list">
                {ingredients.map((it, i) => (
                  <li key={`${it.name}-${i}`} className={it.missing ? "missing" : "have"}>
                    <span className="ing-img placeholder">{it.missing ? "🛒" : "✓"}</span>
                    <span className="ing-name">{it.name}</span>
                    <span className="ing-amount">{it.amount}</span>
                    {it.missing && <span className="tag-missing">不足</span>}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2>不足している材料（買い物リスト）</h2>
              {missing.length === 0 ? (
                <p className="all-set">調味料以外はすべてそろっています！🎉</p>
              ) : (
                <ul className="shopping-list">
                  {missing.map((it, i) => {
                    const key = `${it.name}-${i}`;
                    const checked = checkedShopping.has(key);
                    return (
                      <li key={key} className={checked ? "shopping-checked" : ""}>
                        <label className="shopping-check-label">
                          <input
                            type="checkbox"
                            className="no-pdf"
                            checked={checked}
                            onChange={() => toggleShoppingItem(key)}
                          />
                          🛒 {it.name}
                        </label>
                        <span className="ing-amount">{it.amount}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2>作り方</h2>
              {steps.length > 0 ? (
                <ol className="steps">
                  {steps.map((s, i) => (
                    <li key={i} className="step">
                      <div className="step-no">{i + 1}</div>
                      <div className="step-body">
                        <p className="step-text">{s}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="hint">手順を生成できませんでした。元のレシピをご確認ください。</p>
              )}
            </section>

            <p className="pdf-source">出典: 楽天レシピ {detail.url}</p>
          </>
        )}
      </div>

      {related.length > 0 && (
        <section className="recipe-related">
          <h3 className="recipe-related-title">使える食材で検索した関連レシピ</h3>
          <div className="recipe-related-list">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                className="recipe-related-item"
                onClick={() => onSelectRelated(r)}
              >
                {r.image ? (
                  <img src={r.image} alt={r.title} loading="lazy" />
                ) : (
                  <div className="ds-image-fallback recipe-related-img" role="img" aria-label={r.title}>
                    <span>🍳</span>
                  </div>
                )}
                <span className="recipe-related-item-title">{r.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="detail-actions">
        <Button variant="secondary" onClick={handlePdf} disabled={!ready}>
          📄 PDF表示
        </Button>
        <Button variant="secondary" onClick={handleLine} disabled={!ready}>
          💬 LINEで共有
        </Button>
        <Button as="a" variant="secondary" href={detail.url} target="_blank" rel="noreferrer">
          🍳 楽天レシピを見る ↗
        </Button>
      </div>

      <p className="hint">
        ※ 材料の分量と手順は、AIが{servings}人分に合わせて生成した参考情報です。正確な作り方は元のレシピをご確認ください。
      </p>

      <RecipeFooterBanner onCtaClick={onFoodLossClick} />
    </div>
  );
}
