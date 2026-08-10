/**
 * Skrypt seedujący bazę Buildsy przykładowymi, ręcznie przygotowanymi danymi
 * (fikcyjne hurtownie i cenniki materiałów budowlanych).
 *
 * Uruchomienie: `npm run seed`
 * Z flagą --if-empty: seeduje tylko, jeśli tabela suppliers jest pusta
 * (używane automatycznie przy `npm run dev` / `npm run build`, żeby nie
 * nadpisywać danych i zamówień użytkownika przy każdym restarcie).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Prosty deterministyczny generator liczb pseudolosowych (żeby seed był
// powtarzalny między uruchomieniami, ale dane wyglądały na zróżnicowane).
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260810);

type MaterialSeed = {
  name: string;
  category: string;
  unit: string;
  keywords: string;
  priceMin: number;
  priceMax: number;
};

const MATERIALS: MaterialSeed[] = [
  {
    name: "Beton towarowy C25/30",
    category: "beton",
    unit: "m3",
    keywords:
      "beton, betonu, betonowy, betonowa, C25/30, C20/25, towarowy, mieszanka betonowa, kub, kubik, kubiki, wylewka",
    priceMin: 550,
    priceMax: 680,
  },
  {
    name: "Stal zbrojeniowa B500SP",
    category: "stal",
    unit: "tona",
    keywords:
      "stal, stali, stalowa, zbrojeniowa, zbrojenie, pręty, pręt, B500SP, żebrowana, ton, tony",
    priceMin: 3000,
    priceMax: 3500,
  },
  {
    name: "Cement portlandzki CEM I 42,5R (worek 25kg)",
    category: "cement",
    unit: "worek",
    keywords:
      "cement, cementu, cementowy, portlandzki, CEM I, 42.5, worek cementu, worki",
    priceMin: 22,
    priceMax: 32,
  },
  {
    name: "Płyta OSB3 18mm",
    category: "płyty",
    unit: "szt",
    keywords: "OSB, OSB3, płyta OSB, płyty OSB, deska OSB, płyta drewnopochodna",
    priceMin: 85,
    priceMax: 145,
  },
  {
    name: "Styropian fasadowy EPS 070 10cm",
    category: "izolacje",
    unit: "m2",
    keywords:
      "styropian, izolacja, izolacje, ocieplenie, docieplenie, EPS, termoizolacja, fasadowy",
    priceMin: 16,
    priceMax: 42,
  },
  {
    name: "Pustak ceramiczny Porotherm 25",
    category: "cegła",
    unit: "szt",
    keywords:
      "pustak, cegła, cegły, ceramiczny, porotherm, mur, murowanie, ściana, ściany",
    priceMin: 2,
    priceMax: 6,
  },
  {
    name: "Kruszywo — żwir płukany 8-16mm",
    category: "kruszywa",
    unit: "tona",
    keywords: "żwir, kruszywo, kruszywa, piasek, tłuczeń, kamień, podsypka",
    priceMin: 45,
    priceMax: 72,
  },
  {
    name: "Blacha trapezowa T35 ocynkowana",
    category: "blachy",
    unit: "m2",
    keywords:
      "blacha, blachy, dach, dachowa, trapezowa, pokrycie dachowe, dachówka blaszana",
    priceMin: 45,
    priceMax: 78,
  },
  {
    name: "Zaprawa murarska cementowo-wapienna (worek 25kg)",
    category: "zaprawy",
    unit: "worek",
    keywords: "zaprawa, zaprawy, murarska, klej, tynkarska, mur, worek zaprawy",
    priceMin: 15,
    priceMax: 25,
  },
];

type SupplierSeed = {
  name: string;
  country: string;
  region: string;
  city: string;
  avgDeliveryDaysLocal: number;
  avgDeliveryDaysNational: number;
  reliabilityScore: number;
};

const SUPPLIERS: SupplierSeed[] = [
  { name: "Betoniarnia Poznań-Wschód", country: "PL", region: "Wielkopolska", city: "Poznań", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.5 },
  { name: "Hurtownia Budowlana MURPOL", country: "PL", region: "Wielkopolska", city: "Poznań", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 4, reliabilityScore: 4.2 },
  { name: "Śląska Grupa Budowlana", country: "PL", region: "Śląskie", city: "Katowice", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.6 },
  { name: "Betmix Wrocław", country: "PL", region: "Dolnośląskie", city: "Wrocław", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.3 },
  { name: "Skład Budowlany STALBUD", country: "PL", region: "Dolnośląskie", city: "Wrocław", avgDeliveryDaysLocal: 2, avgDeliveryDaysNational: 4, reliabilityScore: 4.0 },
  { name: "Warszawski Dom Materiałów", country: "PL", region: "Mazowieckie", city: "Warszawa", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.7 },
  { name: "MAT-BUD Warszawa", country: "PL", region: "Mazowieckie", city: "Warszawa", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 4, reliabilityScore: 4.1 },
  { name: "Pomorska Hurtownia Materiałów", country: "PL", region: "Pomorskie", city: "Gdańsk", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.4 },
  { name: "Trójmiejski Skład Budowlany", country: "PL", region: "Pomorskie", city: "Gdynia", avgDeliveryDaysLocal: 2, avgDeliveryDaysNational: 4, reliabilityScore: 4.0 },
  { name: "Krakowski Beton", country: "PL", region: "Małopolskie", city: "Kraków", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 3, reliabilityScore: 4.5 },
  { name: "Łódzka Grupa Materiałowa", country: "PL", region: "Łódzkie", city: "Łódź", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 4, reliabilityScore: 4.2 },
  { name: "Zachodniopomorski Skład Budowlany", country: "PL", region: "Zachodniopomorskie", city: "Szczecin", avgDeliveryDaysLocal: 2, avgDeliveryDaysNational: 5, reliabilityScore: 3.9 },
  { name: "BauZentrum Berlin", country: "DE", region: "Brandenburgia", city: "Berlin", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 6, reliabilityScore: 4.3 },
  { name: "Sächsische Baustoffe", country: "DE", region: "Saksonia", city: "Drezno", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 7, reliabilityScore: 4.0 },
  { name: "Stavebniny Praha", country: "CZ", region: "Kraj Środkowoczeski", city: "Praga", avgDeliveryDaysLocal: 1, avgDeliveryDaysNational: 6, reliabilityScore: 4.1 },
];

// Które materiały (indeksy w MATERIALS) oferuje który dostawca — każdy dostaje 3-6.
const SUPPLIER_MATERIAL_INDEXES: number[][] = [
  [0, 2, 6], // Betoniarnia Poznań-Wschód: beton, cement, kruszywo
  [1, 2, 3, 5, 8], // MURPOL: cement, OSB, pustak, zaprawa, stal
  [0, 1, 4, 5, 6], // Śląska Grupa: beton, stal, styropian, pustak, kruszywo
  [0, 2, 6, 7], // Betmix Wrocław: beton, cement, kruszywo, blacha
  [1, 3, 4, 8], // STALBUD: stal, OSB, styropian, zaprawa
  [0, 1, 3, 4, 5, 7], // Warszawski Dom: beton, stal, OSB, styropian, pustak, blacha
  [2, 5, 6, 8], // MAT-BUD Warszawa: cement, pustak, kruszywo, zaprawa
  [0, 1, 6, 7], // Pomorska Hurtownia: beton, stal, kruszywo, blacha
  [2, 3, 4, 8], // Trójmiejski Skład: cement, OSB, styropian, zaprawa
  [0, 2, 4, 5], // Krakowski Beton: beton, cement, styropian, pustak
  [1, 2, 3, 7, 8], // Łódzka Grupa: stal, cement, OSB, blacha, zaprawa
  [0, 3, 5, 6], // Zachodniopomorski Skład: beton, OSB, pustak, kruszywo
  [1, 3, 4, 7], // BauZentrum Berlin: stal, OSB, styropian, blacha
  [0, 1, 8], // Sächsische Baustoffe: beton, stal, zaprawa
  [1, 2, 4, 6], // Stavebniny Praha: stal, cement, styropian, kruszywo
];

async function seedIfNeeded(force: boolean) {
  const existing = await prisma.supplier.count();
  if (existing > 0 && !force) {
    console.log(
      `[seed] Baza już zawiera ${existing} hurtowni — pomijam seedowanie (--if-empty).`
    );
    return;
  }

  console.log("[seed] Czyszczę istniejące dane...");
  await prisma.order.deleteMany();
  await prisma.query.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.material.deleteMany();
  await prisma.supplier.deleteMany();

  console.log("[seed] Tworzę materiały...");
  const materialRecords = [];
  for (const m of MATERIALS) {
    const rec = await prisma.material.create({
      data: {
        name: m.name,
        category: m.category,
        unit: m.unit,
        keywords: m.keywords,
      },
    });
    materialRecords.push(rec);
  }

  console.log("[seed] Tworzę hurtownie i oferty...");
  for (let i = 0; i < SUPPLIERS.length; i++) {
    const s = SUPPLIERS[i];
    const supplier = await prisma.supplier.create({ data: s });

    const materialIndexes = SUPPLIER_MATERIAL_INDEXES[i] ?? [0, 1, 2];
    for (const idx of materialIndexes) {
      const materialSeed = MATERIALS[idx];
      const material = materialRecords[idx];
      const spread = materialSeed.priceMax - materialSeed.priceMin;
      const price = Math.round(
        (materialSeed.priceMin + rand() * spread) * 100
      ) / 100;
      const inStock = rand() > 0.12; // ~88% dostępności
      const stockQty = inStock
        ? Math.round(20 + rand() * 480)
        : Math.round(rand() * 5);

      await prisma.offer.create({
        data: {
          supplierId: supplier.id,
          materialId: material.id,
          pricePerUnit: price,
          currency: "PLN",
          inStock,
          stockQty,
        },
      });
    }
  }

  const supplierCount = await prisma.supplier.count();
  const materialCount = await prisma.material.count();
  const offerCount = await prisma.offer.count();
  console.log(
    `[seed] Gotowe: ${supplierCount} hurtowni, ${materialCount} materiałów, ${offerCount} ofert.`
  );
}

async function main() {
  const ifEmpty = process.argv.includes("--if-empty");
  await seedIfNeeded(!ifEmpty);
}

main()
  .catch((e) => {
    console.error("[seed] Błąd:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
