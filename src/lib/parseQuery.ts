import { db } from "./db";
import { callClaudeParse } from "./anthropic";
import { parseQueryFallback } from "./parseQueryFallback";
import { matchMaterial } from "./materialMatch";
import type { ParsedQuery } from "@/types";

/**
 * Orkiestruje parsowanie zapytania: próbuje Claude API, a jeśli się nie uda
 * (brak klucza, błąd sieci/API), używa fallbacku po słowach kluczowych.
 * Zawsze próbuje też dopasować materiał z bazy do wyniku.
 */
export async function parseUserQuery(rawQuery: string): Promise<ParsedQuery> {
  const materials = await db.material.findMany();
  const suppliers = await db.supplier.findMany({
    select: { city: true, region: true },
  });

  const claudeResult = await callClaudeParse(rawQuery);
  const fallbackUsed = claudeResult === null;

  const parsed =
    claudeResult ?? parseQueryFallback(rawQuery, materials, suppliers);

  // Dopasuj materiał z bazy — najpierw po kategorii zwróconej przez model /
  // fallback, a jeśli nic nie znaleziono, spróbuj po całej treści zapytania.
  const byCategory = parsed.material_category
    ? matchMaterial(parsed.material_category, materials)
    : null;
  const matched = byCategory ?? matchMaterial(rawQuery, materials);

  return {
    material_category:
      parsed.material_category || matched?.material.category || "",
    quantity: parsed.quantity,
    unit: parsed.unit,
    location: parsed.location,
    deadline_description: parsed.deadline_description,
    fallback_used: fallbackUsed,
    matched_material_id: matched?.material.id ?? null,
  };
}
