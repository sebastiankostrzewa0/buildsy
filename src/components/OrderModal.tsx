"use client";

import { useEffect, useState } from "react";
import type { RankedOffer } from "@/types";

export default function OrderModal({
  offer,
  queryId,
  initialQuantity,
  onClose,
}: {
  offer: RankedOffer;
  queryId: number | null;
  initialQuantity: number | null;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState<number>(
    initialQuantity && initialQuantity > 0 ? initialQuantity : 1
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ order_number: string } | null>(null);

  const total = Math.round(quantity * offer.price_per_unit * 100) / 100;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: offer.offer_id,
          quantity,
          query_id: queryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Błąd zamówienia");
      setResult({ order_number: data.order_number });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się złożyć zamówienia."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card-concrete w-full max-w-md rounded-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!result ? (
          <>
            <h2 className="font-heading text-2xl font-bold mb-1">
              Złóż zamówienie
            </h2>
            <p className="text-sm text-navy/70 mb-4">
              {offer.supplier_name} — {offer.material_name}
            </p>

            <label className="block text-xs uppercase font-mono-data text-navy/60 mb-1">
              Ilość ({offer.unit})
            </label>
            <input
              type="number"
              min={0.01}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-navy/20 rounded-sm px-3 py-2 font-mono-data text-lg mb-4 bg-white text-navy"
            />

            <div className="flex justify-between items-center font-mono-data text-lg mb-6">
              <span className="text-navy/60 text-sm uppercase">Suma</span>
              <span className="font-semibold">
                {total.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {offer.currency}
              </span>
            </div>

            {error && <p className="text-red-700 text-sm mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-navy/20 rounded-sm py-2 font-heading uppercase text-sm"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting || !quantity || quantity <= 0}
                className="btn-signal flex-1 rounded-sm py-2 text-sm"
              >
                {submitting ? "Wysyłanie…" : "Potwierdź"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-heading text-2xl font-bold mb-2 text-signal-dark">
              Zamówienie złożone!
            </h2>
            <p className="text-sm text-navy/70 mb-4">Numer zamówienia:</p>
            <p className="font-mono-data text-3xl font-bold mb-6">
              {result.order_number}
            </p>
            <button
              onClick={onClose}
              className="btn-signal w-full rounded-sm py-2 text-sm"
            >
              Zamknij
            </button>
          </>
        )}
      </div>
    </div>
  );
}
