"use client";

import type { RankedOffer } from "@/types";

function formatPrice(value: number, currency: string) {
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function OfferCard({
  offer,
  onOrder,
}: {
  offer: RankedOffer;
  onOrder: (offer: RankedOffer) => void;
}) {
  return (
    <div
      className={`card-concrete relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-sm ${
        offer.is_recommended ? "ring-2 ring-signal" : ""
      }`}
    >
      {offer.is_recommended && (
        <span className="absolute -top-3 left-4 bg-signal text-navy text-xs font-heading font-bold px-2 py-0.5 rounded-sm tracking-wide">
          Najlepsza oferta
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="font-heading text-xl font-bold truncate">
            {offer.supplier_name}
          </h3>
          <span className="text-xs font-mono-data uppercase text-navy/60">
            {offer.country} · {offer.city}, {offer.region}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span
            className={`font-mono-data ${
              offer.in_stock ? "text-navy/80" : "text-red-700"
            }`}
          >
            {offer.in_stock ? "✓ Dostępne" : "✕ Brak na stanie"}
            {offer.in_stock && offer.stock_qty != null
              ? ` (${offer.stock_qty} ${offer.unit})`
              : ""}
          </span>
          <span className="font-mono-data text-navy/80">
            Dostawa: ~{offer.estimated_delivery_days}{" "}
            {offer.estimated_delivery_days === 1 ? "dzień" : "dni"}
          </span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:gap-2 sm:text-right">
        <div className="font-mono-data text-2xl font-semibold">
          {formatPrice(offer.price_per_unit, offer.currency)}
          <span className="text-sm text-navy/60"> / {offer.unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onOrder(offer)}
          className="btn-signal px-4 py-2 rounded-sm text-sm"
        >
          Zamów
        </button>
      </div>
    </div>
  );
}
