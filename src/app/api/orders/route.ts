import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/orderNumber";
import type { OrderRecord } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const offerId = Number(body?.offer_id);
    const quantity = Number(body?.quantity);
    const rawQueryId = body?.query_id;
    const queryId =
      rawQueryId != null && Number.isFinite(Number(rawQueryId))
        ? Number(rawQueryId)
        : null;

    if (!offerId || !Number.isFinite(offerId)) {
      return NextResponse.json(
        { error: "Pole 'offer_id' jest wymagane." },
        { status: 400 }
      );
    }
    if (!quantity || !Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Pole 'quantity' musi być liczbą dodatnią." },
        { status: 400 }
      );
    }

    const offer = await db.offer.findUnique({
      where: { id: offerId },
      include: { supplier: true, material: true },
    });
    if (!offer) {
      return NextResponse.json(
        { error: "Nie znaleziono oferty." },
        { status: 404 }
      );
    }

    const totalPrice = Math.round(offer.pricePerUnit * quantity * 100) / 100;

    let order = null;
    let lastError: unknown = null;
    // order_number ma unikalny constraint — kolizja jest ekstremalnie mało
    // prawdopodobna, ale na wszelki wypadek ponawiamy generowanie.
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      try {
        order = await db.order.create({
          data: {
            queryId,
            offerId: offer.id,
            quantity,
            totalPrice,
            status: "confirmed",
            orderNumber: generateOrderNumber(),
          },
        });
      } catch (err) {
        lastError = err;
      }
    }
    if (!order) throw lastError ?? new Error("Nie udało się wygenerować zamówienia.");

    return NextResponse.json({
      id: order.id,
      order_number: order.orderNumber,
      status: order.status,
      quantity: order.quantity,
      total_price: order.totalPrice,
      created_at: order.createdAt,
      supplier_name: offer.supplier.name,
      material_name: offer.material.name,
      unit: offer.material.unit,
      currency: offer.currency,
    });
  } catch (err) {
    console.error("[api/orders POST]", err);
    return NextResponse.json(
      { error: "Nie udało się złożyć zamówienia." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        offer: { include: { supplier: true, material: true } },
        query: true,
      },
    });

    const result: OrderRecord[] = orders.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      status: o.status,
      quantity: o.quantity,
      total_price: o.totalPrice,
      created_at: o.createdAt.toISOString(),
      offer: {
        id: o.offer.id,
        price_per_unit: o.offer.pricePerUnit,
        currency: o.offer.currency,
        supplier: {
          id: o.offer.supplier.id,
          name: o.offer.supplier.name,
          city: o.offer.supplier.city,
          country: o.offer.supplier.country,
        },
        material: {
          id: o.offer.material.id,
          name: o.offer.material.name,
          unit: o.offer.material.unit,
        },
      },
      query: o.query ? { id: o.query.id, raw_query: o.query.rawQuery } : null,
    }));

    return NextResponse.json({ orders: result });
  } catch (err) {
    console.error("[api/orders GET]", err);
    return NextResponse.json(
      { error: "Nie udało się pobrać zamówień." },
      { status: 500 }
    );
  }
}
