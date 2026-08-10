import type { Material } from "@prisma/client";
import type { ClaudeParsedFields } from "./anthropic";
import { matchMaterial } from "./materialMatch";
import { normalize, tokenize } from "./text";

export interface LocationCandidate {
  city: string;
  region: string;
}

const UNIT_PATTERNS: Array<{ test: RegExp; unit: string }> = [
  { test: /^(m3|kub\w*)/, unit: "m3" },
  { test: /^ton\w*/, unit: "tona" },
  { test: /^work\w*/, unit: "worek" },
  { test: /^szt\w*/, unit: "szt" },
  { test: /^m2/, unit: "m2" },
];

function detectUnit(word: string): string | null {
  const w = normalize(word);
  for (const { test, unit } of UNIT_PATTERNS) {
    if (test.test(w)) return unit;
  }
  return null;
}

function extractQuantityUnit(rawQuery: string): {
  quantity: number | null;
  unit: string | null;
} {
  const prepped = rawQuery.replace(/³/g, "3").replace(/²/g, "2");
  const tokens = tokenize(prepped);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Liczba + jednostka sklejone razem, np. "10m3", "8ton" (jednostka może
    // zawierać cyfrę, jak "m3"/"m2").
    const glued = token.match(/^(\d+(?:[.,]\d+)?)([a-z][a-z0-9]*)$/);
    if (glued) {
      const unit = detectUnit(glued[2]);
      if (unit) {
        return { quantity: parseFloat(glued[1].replace(",", ".")), unit };
      }
    }

    // Liczba jako osobny token — bierzemy pierwszą napotkaną. Jednostkę
    // szukamy w sąsiednich tokenach, ale zwracamy ilość nawet gdy jednostki
    // nie da się rozpoznać (np. "30 płyt OSB", "1000 pustaków") — wtedy
    // wywołujący dopełni ją jednostką dopasowanego materiału.
    if (/^\d+(?:[.,]\d+)?$/.test(token)) {
      const quantity = parseFloat(token.replace(",", "."));
      const unit = detectUnit(tokens[i + 1] ?? "") ?? detectUnit(tokens[i + 2] ?? "");
      return { quantity, unit };
    }
  }

  return { quantity: null, unit: null };
}

const DEADLINE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bod zaraz\b/, label: "od zaraz" },
  { pattern: /\bnatychmiast\b/, label: "pilne / natychmiast" },
  { pattern: /\bpilne\b/, label: "pilne" },
  { pattern: /\bpojutrze\b/, label: "pojutrze" },
  { pattern: /\bjutro\b/, label: "jutro" },
  { pattern: /\bdzisiaj\b|\bdzis\b/, label: "dzisiaj" },
  {
    pattern: /\bna przyszly tydzien\b|\bprzyszly tydzien\b|\bza tydzien\b/,
    label: "na przyszły tydzień",
  },
  { pattern: /\bw tym tygodniu\b/, label: "w tym tygodniu" },
  { pattern: /\bw tym miesiacu\b/, label: "w tym miesiącu" },
];

function extractDeadline(normalizedQuery: string): string | null {
  for (const { pattern, label } of DEADLINE_PATTERNS) {
    if (pattern.test(normalizedQuery)) return label;
  }
  return null;
}

function extractLocation(
  normalizedQuery: string,
  candidates: LocationCandidate[]
): string | null {
  const seenCities = new Set<string>();
  for (const c of candidates) {
    if (seenCities.has(c.city)) continue;
    seenCities.add(c.city);
    const cityNorm = normalize(c.city);
    const stem = cityNorm.length > 4 ? cityNorm.slice(0, -2) : cityNorm;
    if (stem.length >= 3 && normalizedQuery.includes(stem)) return c.city;
  }
  const seenRegions = new Set<string>();
  for (const c of candidates) {
    if (seenRegions.has(c.region)) continue;
    seenRegions.add(c.region);
    const regionNorm = normalize(c.region);
    if (normalizedQuery.includes(regionNorm)) return c.region;
  }
  return null;
}

/**
 * Prosty parser zapytania oparty wyłącznie o dopasowanie słów kluczowych —
 * używany jako fallback, gdy Claude API jest niedostępne (brak klucza,
 * błąd sieci/API).
 */
export function parseQueryFallback(
  rawQuery: string,
  materials: Material[],
  locationCandidates: LocationCandidate[]
): ClaudeParsedFields {
  const normalizedQuery = normalize(rawQuery);
  const matched = matchMaterial(rawQuery, materials);
  const { quantity, unit } = extractQuantityUnit(rawQuery);
  const location = extractLocation(normalizedQuery, locationCandidates);
  const deadline_description = extractDeadline(normalizedQuery);

  return {
    material_category: matched?.material.category ?? "",
    quantity,
    unit: unit ?? matched?.material.unit ?? null,
    location,
    deadline_description,
  };
}
