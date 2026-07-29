import { randomBytes } from "crypto";

// Excludes visually ambiguous characters (0/O, 1/I/l) since these codes
// get typed by hand or read off a screen.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
