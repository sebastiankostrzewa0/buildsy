import type { Material } from "@prisma/client";
import { normalize } from "./text";

export interface MaterialMatch {
  material: Material;
  score: number;
}

/**
 * Dopasowuje dowolny tekst (kategoria z LLM, albo cała treść zapytania w
 * trybie fallback) do materiału w bazie, licząc trafienia słów kluczowych
 * (`materials.keywords`) oraz nazwy/kategorii materiału w tekście.
 */
export function matchMaterial(
  text: string,
  materials: Material[]
): MaterialMatch | null {
  const normalizedText = normalize(text);
  if (!normalizedText) return null;

  let best: MaterialMatch | null = null;

  for (const material of materials) {
    let score = 0;

    const keywords = material.keywords
      .split(",")
      .map((k) => normalize(k.trim()))
      .filter(Boolean);

    for (const keyword of keywords) {
      if (keyword.length < 2) continue;
      if (normalizedText.includes(keyword)) {
        // Dłuższe, bardziej specyficzne słowa kluczowe ważą więcej.
        score += Math.min(keyword.length / 3, 5);
      }
    }

    const categoryNorm = normalize(material.category);
    if (normalizedText.includes(categoryNorm)) score += 3;

    const nameNorm = normalize(material.name);
    const nameWords = nameNorm.split(/\s+/).filter((w) => w.length > 3);
    for (const word of nameWords) {
      if (normalizedText.includes(word)) score += 1;
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { material, score };
    }
  }

  return best;
}
