import { db } from "@/lib/db";

// Zamówienia zmieniają się przy każdym POST /api/orders — wymuszamy
// renderowanie na żądanie, żeby strona zawsze pokazywała aktualny stan bazy.
export const dynamic = "force-dynamic";

function formatPrice(value: number, currency: string) {
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(date: Date) {
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { offer: { include: { supplier: true, material: true } }, query: true },
  });

  return (
    <div>
      <h1 className="font-heading text-4xl font-extrabold mb-1">Zamówienia</h1>
      <p className="text-concrete/60 mb-8">
        Historia wszystkich zamówień złożonych w Buildsy ({orders.length}).
      </p>

      {orders.length === 0 ? (
        <p className="text-concrete/50 py-12 text-center">
          Brak zamówień. Wyszukaj materiał na stronie głównej i złóż pierwsze
          zamówienie.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-concrete/50 uppercase text-xs font-heading border-b border-concrete/15">
                <th className="py-2 pr-4">Nr zamówienia</th>
                <th className="py-2 pr-4">Materiał</th>
                <th className="py-2 pr-4">Hurtownia</th>
                <th className="py-2 pr-4">Ilość</th>
                <th className="py-2 pr-4">Suma</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-concrete/10 hover:bg-white/5"
                >
                  <td className="py-3 pr-4 font-mono-data font-semibold text-signal">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 pr-4">{order.offer.material.name}</td>
                  <td className="py-3 pr-4">
                    {order.offer.supplier.name}
                    <span className="text-concrete/40">
                      {" "}
                      ({order.offer.supplier.country})
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono-data">
                    {order.quantity} {order.offer.material.unit}
                  </td>
                  <td className="py-3 pr-4 font-mono-data">
                    {formatPrice(order.totalPrice, order.offer.currency)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-signal/20 text-signal border border-signal/40">
                      {order.status === "confirmed" ? "potwierdzone" : order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono-data text-concrete/60">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
