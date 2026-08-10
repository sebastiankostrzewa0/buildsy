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
- PostgreSQL przez Prisma (Vercel Postgres / Neon / dowolny hostowany Postgres)
- Tailwind CSS
- Anthropic SDK (Claude API) z fallbackiem po słowach kluczowych

## Uruchomienie lokalne

Potrzebujesz bazy PostgreSQL — najprościej użyć tego samego Vercel
Postgres/Neon, którego użyjesz na produkcji (jeden connection string do
wszystkiego), albo lokalnej instancji (np. przez Docker):

```bash
docker run --name buildsy-db -e POSTGRES_PASSWORD=buildsy -e POSTGRES_DB=buildsy -p 5432:5432 -d postgres:16
```

Następnie:

```bash
npm install
cp .env.example .env   # uzupełnij DATABASE_URL / DIRECT_URL (i opcjonalnie ANTHROPIC_API_KEY)
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

Przy pierwszym uruchomieniu (`npm run dev` lub `npm run build`) schemat jest
synchronizowany (`prisma db push`) i baza jest automatycznie seedowana
przykładowymi danymi (15 hurtowni, 9 kategorii materiałów, kilkadziesiąt
ofert). Kolejne uruchomienia nie nadpisują danych/zamówień — seed uruchamia
się tylko, gdy tabela `suppliers` jest pusta.

Żeby ręcznie zresetować i ponownie zaseedować bazę:

```bash
npm run seed
```

(`npm run seed`, bez `--if-empty`, zawsze czyści i seeduje od nowa.)

## Deploy na Vercel

1. **Dodaj bazę danych** — w panelu projektu na Vercel: `Storage` → `Create
   Database` → `Postgres` (lub połącz zewnętrzny Neon przez Vercel
   Marketplace). Vercel wystawi kilka zmiennych środowiskowych
   (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` itp.).
2. **Ustaw zmienne środowiskowe** projektu (`Settings` → `Environment
   Variables`):
   - `DATABASE_URL` — wartość `POSTGRES_PRISMA_URL` (connection string przez
     pgbouncer/pooler — używany w runtime przez funkcje serverless)
   - `DIRECT_URL` — wartość `POSTGRES_URL_NON_POOLING` (połączenie
     bezpośrednie — używane tylko przez `prisma db push` podczas builda)
   - `ANTHROPIC_API_KEY` — opcjonalnie, klucz do Claude API (bez niego
     działa fallback po słowach kluczowych)
3. **Deploy** — Vercel wykryje Next.js automatycznie i użyje komendy
   `npm run build` z `package.json`, która przed buildem synchronizuje
   schemat (`prisma db push`) i zaseeduje bazę przy pierwszym uruchomieniu
   (`--if-empty`, więc kolejne deploye tego nie powtarzają).

Uwaga: `prisma db push` przy każdym buildzie jest OK dla MVP (brak
formalnych migracji), ale przy realnych danych produkcyjnych warto docelowo
przejść na `prisma migrate deploy`.

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
- `npm run build` — jw. + build produkcyjny (używane też przez Vercel)
- `npm run seed` — wymusza pełny reset i ponowne zaseedowanie bazy
- `npm run db:push` — synchronizuje schemat Prisma z bazą

## Czego brakuje celowo (poza zakresem MVP)

- Autentykacja/logowanie (single-user)
- Integracja płatności
- Panel dla hurtowni (dane wchodzą tylko przez seed)
- Formalne migracje Prisma (`db push` wystarcza na etapie MVP)
