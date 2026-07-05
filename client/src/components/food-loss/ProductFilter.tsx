import {
  FILTER_KIND_OPTIONS,
  FOOD_TYPE_OPTIONS,
  REGION_OPTIONS,
  PRICE_RANGE_OPTIONS,
} from "../../constants";
import type { ProductFilterState } from "../../types";

interface Props {
  filter: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
}

/** 商品の絞り込みUI（食品種類/地域別/金額別のラジオボタン切り替え） */
export default function ProductFilter({ filter, onChange }: Props) {
  return (
    <div className="fl-filter">
      <div className="fl-filter-kind" role="radiogroup" aria-label="絞り込み方法">
        {FILTER_KIND_OPTIONS.map((opt) => (
          <label key={opt.value} className="fl-filter-kind-option">
            <input
              type="radio"
              name="fl-filter-kind"
              value={opt.value}
              checked={filter.kind === opt.value}
              onChange={() => onChange({ ...filter, kind: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {filter.kind === "food-type" && (
        <div className="fl-filter-values" role="radiogroup" aria-label="食品種類">
          {FOOD_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="fl-filter-value-option">
              <input
                type="radio"
                name="fl-filter-food-type"
                value={opt.value}
                checked={filter.foodType === opt.value}
                onChange={() => onChange({ ...filter, foodType: opt.value })}
              />
              {opt.emoji} {opt.label}
            </label>
          ))}
        </div>
      )}

      {filter.kind === "region" && (
        <div className="fl-filter-values" role="radiogroup" aria-label="地域別">
          {REGION_OPTIONS.map((opt) => (
            <label key={opt.value} className="fl-filter-value-option">
              <input
                type="radio"
                name="fl-filter-region"
                value={opt.value}
                checked={filter.region === opt.value}
                onChange={() => onChange({ ...filter, region: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {filter.kind === "price" && (
        <div className="fl-filter-values" role="radiogroup" aria-label="金額別">
          {PRICE_RANGE_OPTIONS.map((opt) => (
            <label key={opt.value} className="fl-filter-value-option">
              <input
                type="radio"
                name="fl-filter-price"
                value={opt.value}
                checked={filter.priceRange === opt.value}
                onChange={() => onChange({ ...filter, priceRange: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
