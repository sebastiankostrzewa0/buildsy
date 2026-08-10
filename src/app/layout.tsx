import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buildsy — Agent AI do zakupów materiałów budowlanych",
  description:
    "Buildsy porównuje oferty hurtowni materiałów budowlanych i pomaga złożyć zamówienie w kilka sekund.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="blueprint-bg min-h-screen">
        <header className="border-b border-white/10 bg-navy/95 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-3 h-3 bg-signal inline-block" aria-hidden />
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-concrete group-hover:text-signal transition-colors">
                BUILDSY
              </span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6 font-heading text-sm sm:text-base">
              <Link
                href="/"
                className="text-concrete/80 hover:text-signal transition-colors"
              >
                Wyszukiwarka
              </Link>
              <Link
                href="/orders"
                className="text-concrete/80 hover:text-signal transition-colors"
              >
                Zamówienia
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-concrete/40 font-mono-data">
          Buildsy MVP — dane przykładowe, nie rzeczywiste hurtownie.
        </footer>
      </body>
    </html>
  );
}
