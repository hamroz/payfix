const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const LIMIT = 256 - (256 % ALPHABET.length); // reject bytes above this to avoid modulo bias

/** Uniformly random base58 string. 16 chars ≈ 93 bits of entropy. */
export function randomId(length = 16): string {
  let out = "";
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < LIMIT) out += ALPHABET[b % ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export const newId = (prefix: string) => `${prefix}_${randomId(14)}`;

/** Unguessable bearer token for links and sessions (~187 bits). */
export const newToken = () => randomId(32);
