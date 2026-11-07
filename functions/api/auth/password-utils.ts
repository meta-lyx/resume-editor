// Password hashing with PBKDF2 (Web Crypto API, works in Cloudflare Workers).
// Stored format: "pbkdf2:iterations:base64salt:base64hash"

const ITERATIONS = 100_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;
const ALGORITHM = 'PBKDF2';
const HASH_FN = 'SHA-256';

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    ALGORITHM,
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations, hash: HASH_FN },
    keyMaterial,
    HASH_BYTES * 8,
  );
}

/** Hash a plaintext password. Returns a storable string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveKey(password, salt, ITERATIONS);
  return `pbkdf2:${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}

/** Verify a plaintext password against a stored hash string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts[0] !== 'pbkdf2' || parts.length !== 4) return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const derived = new Uint8Array(await deriveKey(password, salt, iterations));
  // Constant-time comparison
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}
