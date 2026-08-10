import { NextRequest, NextResponse } from "next/server";
import { parseUserQuery } from "@/lib/parseQuery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "Pole 'query' jest wymagane." },
        { status: 400 }
      );
    }

    const parsed = await parseUserQuery(query);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[api/parse-query]", err);
    return NextResponse.json(
      { error: "Nie udało się sparsować zapytania." },
      { status: 500 }
    );
  }
}
