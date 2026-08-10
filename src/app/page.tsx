"use client";

import { useEffect, useState, useCallback } from "react";
import ExampleChips from "@/components/ExampleChips";
import AgentWorkingState from "@/components/AgentWorkingState";
import OfferCard from "@/components/OfferCard";
import FilterSortBar from "@/components/FilterSortBar";
import OrderModal from "@/components/OrderModal";
import QueryHistory, { QueryHistoryItem } from "@/components/QueryHistory";
import type {
  CountryFilter,
  ParsedQuery,
  RankedOffer,
  SearchResponse,
  SortBy,
} from "@/types";

type Stage = "idle" | "parsing" | "searching" | "done" | "error";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [orderingOffer, setOrderingOffer] = useState<RankedOffer | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/queries");
      const data = await res.json();
      setHistory(data.queries ?? []);
    } catch {
      // historia jest opcjonalna — cichy fail, nie blokuje reszty appki
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  async function runFullSearch(
    rawQuery: string,
    nextSortBy: SortBy,
    nextCountryFilter: CountryFilter
  ) {
    setErrorMessage(null);
    setSearchResponse(null);
    setStage("parsing");
    try {
      const parseRes = await fetch("/api/parse-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: rawQuery }),
      });
      const parsed = await parseRes.json();
      if (!parseRes.ok) throw new Error(parsed?.error ?? "Błąd parsowania zapytania.");
      setParsedQuery(parsed);

      setStage("searching");
      const searchData = await runSearchOnly(parsed, rawQuery, nextSortBy, nextCountryFilter);
      setSearchResponse(searchData);
      setStage("done");
      refreshHistory();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Coś poszło nie tak. Spróbuj ponownie."
      );
      setStage("error");
    }
  }

  async function runSearchOnly(
    parsed: ParsedQuery,
    rawQuery: string,
    nextSortBy: SortBy,
    nextCountryFilter: CountryFilter
  ): Promise<SearchResponse> {
    const searchRes = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_category: parsed.material_category,
        quantity: parsed.quantity,
        unit: parsed.unit,
        location: parsed.location,
        deadline_description: parsed.deadline_description,
        matched_material_id: parsed.matched_material_id,
        raw_query: rawQuery,
        sort_by: nextSortBy,
        country_filter: nextCountryFilter,
      }),
    });
    const data = await searchRes.json();
    if (!searchRes.ok) throw new Error(data?.error ?? "Błąd wyszukiwania ofert.");
    return data;
  }

  async function handleFilterChange(next: {
    sortBy: SortBy;
    countryFilter: CountryFilter;
  }) {
    setSortBy(next.sortBy);
    setCountryFilter(next.countryFilter);
    if (!parsedQuery) return;
    setStage("searching");
    try {
      const data = await runSearchOnly(
        parsedQuery,
        query,
        next.sortBy,
        next.countryFilter
      );
      setSearchResponse(data);
      setStage("done");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Nie udało się zaktualizować wyników."
      );
      setStage("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    runFullSearch(trimmed, sortBy, countryFilter);
  }

  function handleChipSelect(text: string) {
    setQuery(text);
    runFullSearch(text, sortBy, countryFilter);
  }

  function handleHistorySelect(rawQuery: string) {
    setQuery(rawQuery);
    runFullSearch(rawQuery, sortBy, countryFilter);
  }

  const isLoading = stage === "parsing" || stage === "searching";
  const offers = searchResponse?.offers ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <section className="text-center mb-6">
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight">
            Znajdź materiały <span className="text-signal">w sekundy</span>
          </h1>
          <p className="text-concrete/60 mt-2 max-w-xl mx-auto">
            Opisz czego potrzebujesz — agent porówna oferty hurtowni i
            zaproponuje najlepszą.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='np. "10m³ betonu do Poznania na jutro"'
              className="flex-1 px-4 py-3 rounded-sm bg-concrete text-navy placeholder:text-navy/40 font-body text-base border border-transparent focus:border-signal focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn-signal px-6 py-3 rounded-sm text-base"
            >
              {isLoading ? "Szukam…" : "Szukaj"}
            </button>
          </div>
        </form>

        <ExampleChips onSelect={handleChipSelect} />

        <div className="mt-10">
          {isLoading && (
            <AgentWorkingState stage={stage === "parsing" ? "parsing" : "searching"} />
          )}

          {stage === "error" && (
            <div className="border border-red-500/40 bg-red-500/10 text-red-200 rounded-sm px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          {stage === "done" && parsedQuery && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-mono-data text-concrete/70">
                <span>
                  Rozpoznano: <strong className="text-concrete">{searchResponse?.material_name ?? (parsedQuery.material_category || "?")}</strong>
                </span>
                {parsedQuery.quantity != null && (
                  <span>· {parsedQuery.quantity} {parsedQuery.unit ?? ""}</span>
                )}
                {parsedQuery.location && <span>· {parsedQuery.location}</span>}
                {parsedQuery.deadline_description && (
                  <span>· termin: {parsedQuery.deadline_description}</span>
                )}
                {parsedQuery.fallback_used && (
                  <span className="ml-1 bg-signal/20 text-signal border border-signal/40 rounded-full px-2 py-0.5 text-xs">
                    Tryb fallback (bez Claude API)
                  </span>
                )}
              </div>

              {offers.length > 0 && (
                <FilterSortBar
                  sortBy={sortBy}
                  countryFilter={countryFilter}
                  disabled={isLoading}
                  onChange={handleFilterChange}
                />
              )}

              {offers.length === 0 && (
                <p className="text-concrete/60 text-sm py-8 text-center">
                  {searchResponse?.message ?? "Brak ofert dla tego zapytania."}
                </p>
              )}

              <div className="space-y-3">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.offer_id}
                    offer={offer}
                    onOrder={setOrderingOffer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside>
        <QueryHistory
          items={history}
          loading={historyLoading}
          onSelect={handleHistorySelect}
        />
      </aside>

      {orderingOffer && (
        <OrderModal
          offer={orderingOffer}
          queryId={searchResponse?.query_id ?? null}
          initialQuantity={parsedQuery?.quantity ?? null}
          onClose={() => {
            setOrderingOffer(null);
            refreshHistory();
          }}
        />
      )}
    </div>
  );
}
