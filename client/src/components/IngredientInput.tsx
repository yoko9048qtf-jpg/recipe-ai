import { useMemo, useState } from "react";
import CommonIngredients from "./CommonIngredients";
import PhotoUpload from "./PhotoUpload";
import { COMMON_INGREDIENTS, DEFAULT_SELECTED } from "../commonIngredients";
import { CUISINE_OPTIONS, type Cuisine } from "../types";

interface Props {
  loading: boolean;
  onSubmit: (ingredients: string[], cuisine: Cuisine, servings: number) => void;
}

// 定番食材の集合（自由入力タグと区別するため）
const COMMON_SET = new Set(Object.values(COMMON_INGREDIENTS).flat());

export default function IngredientInput({ loading, onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTED));
  const [text, setText] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine>("japanese");
  // 作りたい人数（デフォルト2人分）
  const [peopleText, setPeopleText] = useState("2");
  const people = parseInt(peopleText, 10);
  const peopleValid = Number.isInteger(people) && people >= 1 && people <= 99;

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addText() {
    const value = text.trim();
    if (!value) return;
    setSelected((prev) => new Set(prev).add(value));
    setText("");
  }

  function mergeDetected(items: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((i) => {
        const v = i.trim();
        if (v) next.add(v);
      });
      return next;
    });
  }

  // 自由入力・写真で追加された（定番リストにない）食材タグ
  const freeTags = useMemo(
    () => [...selected].filter((s) => !COMMON_SET.has(s)),
    [selected]
  );

  const selectedList = [...selected];

  return (
    <div className="ingredient-input">
      <p className="pantry-note">
        💡 調味料（醤油・味噌・塩・砂糖・酢・みりん・油・ケチャップ・マヨネーズなど）は
        <strong>常備品</strong>として、すべてある前提で検索します。
      </p>

      <section className="panel">
        <h2>① 今ある食材をチェック</h2>
        <CommonIngredients selected={selected} onToggle={toggle} />
      </section>

      <section className="panel">
        <h2>② その他の食材を追加</h2>
        <div className="free-input">
          <input
            type="text"
            value={text}
            placeholder="例: ブロッコリー"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addText();
              }
            }}
          />
          <button type="button" onClick={addText}>
            追加
          </button>
        </div>
        {freeTags.length > 0 && (
          <div className="chips">
            {freeTags.map((tag) => (
              <span key={tag} className="chip-check active tag">
                {tag}
                <button
                  type="button"
                  className="remove"
                  aria-label={`${tag} を削除`}
                  onClick={() => toggle(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>③ 写真から読み取る（任意）</h2>
        <PhotoUpload onDetected={mergeDetected} />
      </section>

      <section className="panel">
        <h2>④ 今日の気分は？</h2>
        <p className="cuisine-note">選んだジャンルに合ったレシピを提案します。</p>
        <div className="cuisine-choices">
          {CUISINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`cuisine-btn ${cuisine === opt.value ? "active" : ""}`}
              aria-pressed={cuisine === opt.value}
              onClick={() => setCuisine(opt.value)}
            >
              <span className="cuisine-emoji">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>⑤ 何人分作りますか？</h2>
        <p className="cuisine-note">材料は指定した人数分の分量で表示します。</p>
        <div className="people-input">
          <input
            type="number"
            min={1}
            max={99}
            inputMode="numeric"
            value={peopleText}
            placeholder="例: 2"
            aria-label="作りたい人数"
            onChange={(e) => setPeopleText(e.target.value)}
          />
          <span className="people-unit">人分</span>
        </div>
        {!peopleValid && (
          <p className="people-question">👉 何人分の料理を作りますか？（1〜99）</p>
        )}
      </section>

      <div className="submit-bar">
        <div className="selected-summary">
          {(() => {
            const c = CUISINE_OPTIONS.find((o) => o.value === cuisine);
            return c ? `${c.emoji} ${c.label}` : "";
          })()}{" "}
          ／ {peopleValid ? `${people}人分` : "人数未入力"} ／ 選択中（
          {selectedList.length}）:{" "}
          {selectedList.length > 0 ? selectedList.join("、") : "まだありません"}
        </div>
        <button
          type="button"
          className="primary"
          disabled={loading || selectedList.length === 0 || !peopleValid}
          onClick={() => onSubmit(selectedList, cuisine, people)}
        >
          {loading ? "検索中…" : "レシピを探す"}
        </button>
      </div>
    </div>
  );
}
