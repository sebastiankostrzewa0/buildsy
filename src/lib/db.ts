import { PrismaClient } from "@prisma/client";

// Standardowy singleton Prisma Client dla Next.js (unika tworzenia nowych
// połączeń przy każdym hot-reload w trybie dev).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
