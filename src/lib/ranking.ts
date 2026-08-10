import type { Supplier } from "@prisma/client";
import { normalize } from "./text";

/** Szacuje liczbę dni dostawy hurtowni na podstawie lokalizacji z zapytania. */
export function estimateDeliveryDays(
  supplier: Pick<
    Supplier,
    "city" | "region" | "avgDeliveryDaysLocal" | "avgDeliveryDaysNational"
  >,
  location: string | null | undefined
): number {
  if (!location) return supplier.avgDeliveryDaysNational;

  const normLocation = normalize(location);
  const normCity = normalize(supplier.city);
  const normRegion = normalize(supplier.region);

  const cityStem =
    normCity.length > 4 ? normCity.slice(0, -2) : normCity;
  const locationStem =
    normLocation.length > 4 ? normLocation.slice(0, -2) : normLocation;

  const isLocal =
    normLocation.includes(cityStem) ||
    normCity.includes(locationStem) ||
    normLocation.includes(normRegion) ||
    normRegion.includes(normLocation);

  return isLocal ? supplier.avgDeliveryDaysLocal : supplier.avgDeliveryDaysNational;
}

export interface RankableOffer {
  pricePerUnit: number;
  deliveryDays: number;
  inStock: boolean;
}

const PRICE_WEIGHT = 0.65;
const DELIVERY_WEIGHT = 0.35;
const OUT_OF_STOCK_PENALTY = 0.4;

/**
 * Liczy porównywalny "score" dla ofert tego samego materiału: waży
 * znormalizowaną cenę i czas dostawy, dokłada karę za brak dostępności.
 * Niższy score = lepsza oferta. Zwraca listę posortowaną rosnąco.
 */
export function rankOffers<T extends RankableOffer>(
  offers: T[]
): (T & { score: number; isRecommended: boolean })[] {
  if (offers.length === 0) return [];

  const prices = offers.map((o) => o.pricePerUnit);
  const deliveries = offers.map((o) => o.deliveryDays);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);
  const priceRange = maxPrice - minPrice || 1;
  const deliveryRange = maxDelivery - minDelivery || 1;

  const scored = offers.map((o) => {
    const normPrice = (o.pricePerUnit - minPrice) / priceRange;
    const normDelivery = (o.deliveryDays - minDelivery) / deliveryRange;
    let score = normPrice * PRICE_WEIGHT + normDelivery * DELIVERY_WEIGHT;
    if (!o.inStock) score += OUT_OF_STOCK_PENALTY;
    return { ...o, score: Math.round(score * 1000) / 1000, isRecommended: false };
  });

  scored.sort((a, b) => a.score - b.score);
  if (scored.length > 0) scored[0].isRecommended = true;

  return scored;
}
