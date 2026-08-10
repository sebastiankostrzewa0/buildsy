import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET bez parametrów żądania zostałby domyślnie statycznie zoptymalizowany
// przez Next.js (zamrożony na czas builda) — wymuszamy dynamiczne wykonanie,
// żeby historia zawsze odzwierciedlała aktualny stan bazy.
export const dynamic = "force-dynamic";

/** Historia zapytań (do panelu bocznego na stronie głównej). */
export async function GET() {
  try {
    const queries = await db.query.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { material: true },
    });

    const result = queries.map((q) => ({
      id: q.id,
      raw_query: q.rawQuery,
      parsed_location: q.parsedLocation,
      parsed_deadline: q.parsedDeadline,
      parsed_quantity: q.parsedQuantity,
      material_name: q.material?.name ?? null,
      material_unit: q.material?.unit ?? null,
      created_at: q.createdAt.toISOString(),
    }));

    return NextResponse.json({ queries: result });
  } catch (err) {
    console.error("[api/queries GET]", err);
    return NextResponse.json(
      { error: "Nie udało się pobrać historii zapytań." },
      { status: 500 }
    );
  }
}
