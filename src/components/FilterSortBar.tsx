"use client";

import type { CountryFilter, SortBy } from "@/types";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "score", label: "Rekomendowane" },
  { value: "price", label: "Cena" },
  { value: "delivery", label: "Czas dostawy" },
];

const COUNTRY_OPTIONS: { value: CountryFilter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "PL", label: "Tylko PL" },
  { value: "foreign", label: "Zagraniczne" },
];

export default function FilterSortBar({
  sortBy,
  countryFilter,
  disabled,
  onChange,
}: {
  sortBy: SortBy;
  countryFilter: CountryFilter;
  disabled?: boolean;
  onChange: (next: { sortBy: SortBy; countryFilter: CountryFilter }) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-3 border-y border-concrete/15 font-mono-data text-sm">
      <div className="flex items-center gap-2">
        <span className="text-concrete/50 uppercase text-xs">Sortuj:</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={disabled}
              onClick={() => onChange({ sortBy: opt.value, countryFilter })}
              className={`px-2.5 py-1 rounded-sm border transition-colors ${
                sortBy === opt.value
                  ? "bg-signal text-navy border-signal"
                  : "border-concrete/25 text-concrete/70 hover:border-signal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-concrete/50 uppercase text-xs">Kraj:</span>
        <div className="flex gap-1">
          {COUNTRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={disabled}
              onClick={() => onChange({ sortBy, countryFilter: opt.value })}
              className={`px-2.5 py-1 rounded-sm border transition-colors ${
                countryFilter === opt.value
                  ? "bg-signal text-navy border-signal"
                  : "border-concrete/25 text-concrete/70 hover:border-signal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
