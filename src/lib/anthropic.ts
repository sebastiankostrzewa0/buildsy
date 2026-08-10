import Anthropic from "@anthropic-ai/sdk";

export interface ClaudeParsedFields {
  material_category: string;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  deadline_description: string | null;
}

// Uwaga: w oryginalnym briefie wskazano "claude-sonnet-4-6", ale to nie jest
// aktualny identyfikator modelu — używamy najnowszego dostępnego Sonneta.
const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `Jesteś parserem zapytań zakupowych dla platformy Buildsy (zakupy materiałów budowlanych dla firm budowlanych).
Otrzymujesz zapytanie w języku naturalnym od klienta (deweloper / generalny wykonawca).
Zwróć WYŁĄCZNIE obiekt JSON (bez markdown, bez code fence, bez żadnego dodatkowego tekstu) o dokładnie takich kluczach:
{
  "material_category": string,        // ogólna nazwa/kategoria materiału po polsku, np. "beton", "stal zbrojeniowa", "cement", "płyty OSB", "styropian", "pustak", "kruszywo", "blacha dachowa", "zaprawa"
  "quantity": number | null,          // sama wartość liczbowa zamówienia, bez jednostki
  "unit": string | null,              // jednostka, np. "m3", "tona", "worek", "szt", "m2"
  "location": string | null,          // miasto lub region dostawy wspomniany w zapytaniu
  "deadline_description": string | null // opis terminu tak jak w zapytaniu, np. "jutro", "na przyszły tydzień"
}
Jeśli którejś informacji brak w zapytaniu, użyj null. Nie dodawaj żadnych innych pól ani komentarzy.`;

/**
 * Wywołuje Claude API do sparsowania zapytania. Zwraca `null` jeśli brak
 * klucza API, błąd sieci/API, albo nie da się sparsować odpowiedzi — w takim
 * wypadku wywołujący powinien użyć fallbacku po słowach kluczowych.
 */
export async function callClaudeParse(
  rawQuery: string
): Promise<ClaudeParsedFields | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: rawQuery }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const jsonText = extractJson(textBlock.text);
    const parsed = JSON.parse(jsonText);

    if (
      typeof parsed.material_category !== "string" ||
      !parsed.material_category.trim()
    ) {
      return null;
    }

    return {
      material_category: parsed.material_category,
      quantity: typeof parsed.quantity === "number" ? parsed.quantity : null,
      unit: typeof parsed.unit === "string" ? parsed.unit : null,
      location: typeof parsed.location === "string" ? parsed.location : null,
      deadline_description:
        typeof parsed.deadline_description === "string"
          ? parsed.deadline_description
          : null,
    };
  } catch (err) {
    console.error(
      "[anthropic] Wywołanie Claude API nie powiodło się, przełączam na fallback po słowach kluczowych:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  // Na wypadek gdyby model jednak owinął odpowiedź w ```json ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}
