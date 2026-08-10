"use client";

export interface QueryHistoryItem {
  id: number;
  raw_query: string;
  parsed_location: string | null;
  parsed_deadline: string | null;
  material_name: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "przed chwilą";
  if (mins < 60) return `${mins} min temu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  return `${days} dni temu`;
}

export default function QueryHistory({
  items,
  loading,
  onSelect,
}: {
  items: QueryHistoryItem[];
  loading: boolean;
  onSelect: (rawQuery: string) => void;
}) {
  return (
    <div className="card-concrete rounded-sm p-4 h-fit">
      <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-signal inline-block" />
        Historia zapytań
      </h2>
      {loading && (
        <p className="text-sm text-navy/50 font-mono-data">Ładowanie…</p>
      )}
      {!loading && items.length === 0 && (
        <p className="text-sm text-navy/50">
          Brak zapytań — wpisz pierwsze wyszukiwanie powyżej.
        </p>
      )}
      <ul className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.raw_query)}
              className="w-full text-left px-3 py-2 rounded-sm border border-navy/10 hover:border-signal hover:bg-signal/5 transition-colors"
            >
              <p className="text-sm font-medium truncate">{item.raw_query}</p>
              <p className="text-xs text-navy/50 font-mono-data mt-0.5">
                {item.material_name ?? "nie dopasowano"}
                {item.parsed_location ? ` · ${item.parsed_location}` : ""}
                {" · "}
                {timeAgo(item.created_at)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
