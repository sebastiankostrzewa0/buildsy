# Buildsy — MVP

Agent AI do zakupów materiałów budowlanych. Wpisz zapytanie w naturalnym
języku (materiał, ilość, lokalizacja, termin), a Buildsy przeszuka katalog
hurtowni i zwróci uszeregowane porównanie ofert z możliwością złożenia
zamówienia.

To jest MVP na przykładowych, ręcznie przygotowanych danych (fikcyjne
hurtownie i cenniki) — logika parsowania, wyszukiwania, rankingu i zapisu
zamówień jest w pełni działająca.

## Stack

- Next.js 14 (App Router) + TypeScript
- SQLite przez Prisma
- Tailwind CSS
- Anthropic SDK (Claude API) z fallbackiem po słowach kluczowych

## Uruchomienie

```bash
npm install
cp .env.example .env   # opcjonalnie uzupełnij ANTHROPIC_API_KEY
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

Przy pierwszym uruchomieniu (`npm run dev` lub `npm run build`) baza SQLite
(`prisma/dev.db`) jest automatycznie tworzona i seedowana przykładowymi
danymi (15 hurtowni, 9 kategorii materiałów, kilkadziesiąt ofert). Kolejne
uruchomienia nie nadpisują danych/zamówień — seed uruchamia się tylko, gdy
tabela `suppliers` jest pusta.

Żeby ręcznie zresetować i ponownie zaseedować bazę:

```bash
rm -f prisma/dev.db
npm run seed
```

## Klucz Claude API (opcjonalny)

`/api/parse-query` używa Claude API (`ANTHROPIC_API_KEY`) do parsowania
zapytań w naturalnym języku. **Bez klucza aplikacja nadal w pełni działa** —
automatycznie włącza się fallback oparty o dopasowanie słów kluczowych z
`materials.keywords`. Interfejs pokazuje wtedy plakietkę „Tryb fallback (bez
Claude API)" przy wynikach.

## Struktura

```
prisma/schema.prisma   # schemat bazy (suppliers, materials, offers, queries, orders)
prisma/seed.ts         # dane przykładowe
src/app/                # strony (App Router) + API routes
src/components/         # komponenty UI
src/lib/                # logika: Prisma client, Claude API, fallback, ranking
src/types/               # wspólne typy TS
```

## Skrypty

- `npm run dev` — uruchamia bazę (generate + push + seed-if-empty) i dev server
- `npm run build` — jw. + build produkcyjny
- `npm run seed` — wymusza pełny reset i ponowne zaseedowanie bazy
- `npm run db:push` — synchronizuje schemat Prisma z bazą SQLite

## Czego brakuje celowo (poza zakresem MVP)

- Autentykacja/logowanie (single-user)
- Integracja płatności
- Panel dla hurtowni (dane wchodzą tylko przez seed)
- Deployment/hosting — działa lokalnie
