import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchMaterial } from "@/lib/materialMatch";
import { estimateDeliveryDays, rankOffers } from "@/lib/ranking";
import type {
  CountryFilter,
  RankedOffer,
  SearchRequestBody,
  SearchResponse,
  SortBy,
} from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as SearchRequestBody;

    const materialCategory = body.material_category?.trim() ?? "";
    const rawQuery = body.raw_query?.trim() || materialCategory;
    const location = body.location?.trim() || null;
    const quantity = typeof body.quantity === "number" ? body.quantity : null;
    const deadline = body.deadline_description ?? null;
    const sortBy: SortBy = body.sort_by ?? "score";
    const countryFilter: CountryFilter = body.country_filter ?? "all";

    const materials = await db.material.findMany();

    let material =
      body.matched_material_id != null
        ? materials.find((m) => m.id === body.matched_material_id) ?? null
        : null;
    if (!material) {
      const match = matchMaterial(materialCategory || rawQuery, materials);
      material = match?.material ?? null;
    }

    // Zapisz zapytanie do historii — niezależnie od tego, czy udało się
    // dopasować materiał (historia ma pokazywać też nieudane zapytania).
    const savedQuery = await db.query.create({
      data: {
        rawQuery: rawQuery || "(puste zapytanie)",
        parsedMaterialId: material?.id ?? null,
        parsedQuantity: quantity,
        parsedLocation: location,
        parsedDeadline: deadline,
      },
    });

    if (!material) {
      const response: SearchResponse = {
        query_id: savedQuery.id,
        material_id: null,
        material_name: null,
        offers: [],
        message:
          "Nie znaleziono materiału pasującego do zapytania w katalogu Buildsy.",
      };
      return NextResponse.json(response);
    }

    const offers = await db.offer.findMany({
      where: { materialId: material.id },
      include: { supplier: true, material: true },
    });

    const filteredOffers = offers.filter((o) => {
      if (countryFilter === "PL") return o.supplier.country === "PL";
      if (countryFilter === "foreign") return o.supplier.country !== "PL";
      return true;
    });

    const rankInput = filteredOffers.map((o) => ({
      offerId: o.id,
      pricePerUnit: o.pricePerUnit,
      currency: o.currency,
      inStock: o.inStock,
      stockQty: o.stockQty,
      deliveryDays: estimateDeliveryDays(o.supplier, location),
      supplier: o.supplier,
    }));

    const ranked = rankOffers(rankInput); // posortowane wg score (najlepsza pierwsza)

    let displayOrder = ranked;
    if (sortBy === "price") {
      displayOrder = [...ranked].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === "delivery") {
      displayOrder = [...ranked].sort((a, b) => a.deliveryDays - b.deliveryDays);
    }

    const offersResponse: RankedOffer[] = displayOrder.map((r) => ({
      offer_id: r.offerId,
      supplier_id: r.supplier.id,
      supplier_name: r.supplier.name,
      country: r.supplier.country,
      region: r.supplier.region,
      city: r.supplier.city,
      material_id: material!.id,
      material_name: material!.name,
      unit: material!.unit,
      price_per_unit: r.pricePerUnit,
      currency: r.currency,
      in_stock: r.inStock,
      stock_qty: r.stockQty,
      estimated_delivery_days: r.deliveryDays,
      score: r.score,
      is_recommended: r.isRecommended,
    }));

    const response: SearchResponse = {
      query_id: savedQuery.id,
      material_id: material.id,
      material_name: material.name,
      offers: offersResponse,
      message:
        offersResponse.length === 0
          ? "Brak ofert spełniających wybrane filtry."
          : undefined,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json(
      { error: "Nie udało się wyszukać ofert." },
      { status: 500 }
    );
  }
}
