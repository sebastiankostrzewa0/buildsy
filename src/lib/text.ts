/** Usuwa polskie znaki diakrytyczne i normalizuje do małych liter — pomaga
 * przy prostym dopasowaniu tekstu (fallback bez LLM). */
const DIACRITICS: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => DIACRITICS[ch] ?? ch)
    .join("")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9.,\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
