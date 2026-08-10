// Wspólne typy używane przez API i frontend.

/** Wynik parsowania zapytania w naturalnym języku (Claude API lub fallback). */
export interface ParsedQuery {
  material_category: string;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  deadline_description: string | null;
  /** true, jeśli wynik pochodzi z fallbacku po słowach kluczowych (brak/błąd Claude API). */
  fallback_used: boolean;
  /** id dopasowanego materiału w bazie, jeśli udało się dopasować. */
  matched_material_id: number | null;
}

/** Filtry i sortowanie przekazywane do /api/search. */
export type CountryFilter = "all" | "PL" | "foreign";
export type SortBy = "score" | "price" | "delivery";

export interface SearchRequestBody {
  material_category: string;
  quantity?: number | null;
  unit?: string | null;
  location?: string | null;
  deadline_description?: string | null;
  matched_material_id?: number | null;
  query_id?: number | null;
  raw_query?: string | null;
  sort_by?: SortBy;
  country_filter?: CountryFilter;
}

/** Pojedyncza oferta wzbogacona o dane hurtowni i wynik rankingu. */
export interface RankedOffer {
  offer_id: number;
  supplier_id: number;
  supplier_name: string;
  country: string;
  region: string;
  city: string;
  material_id: number;
  material_name: string;
  unit: string;
  price_per_unit: number;
  currency: string;
  in_stock: boolean;
  stock_qty: number | null;
  estimated_delivery_days: number;
  score: number;
  is_recommended: boolean;
}

export interface SearchResponse {
  query_id: number | null;
  material_id: number | null;
  material_name: string | null;
  offers: RankedOffer[];
  message?: string;
}

export interface OrderRecord {
  id: number;
  order_number: string;
  status: string;
  quantity: number;
  total_price: number;
  created_at: string;
  offer: {
    id: number;
    price_per_unit: number;
    currency: string;
    supplier: { id: number; name: string; city: string; country: string };
    material: { id: number; name: string; unit: string };
  };
  query: { id: number; raw_query: string } | null;
}
