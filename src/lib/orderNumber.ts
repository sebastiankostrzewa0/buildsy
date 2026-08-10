const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bez znaków mylących (0/O, 1/I)

/** Generuje numer zamówienia w formacie BLD-XXXXXX. */
export function generateOrderNumber(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `BLD-${suffix}`;
}
