/**
 * WebCrypto AES-256-GCM URL-safe token encryption & decryption for wedding guest links.
 * Compatible across browser and modern Node.js runtimes without node:crypto polyfills.
 */

const SECRET_SALT = "khmer-e-invitation-guest-key-v1";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getEncryptionKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.digest(
    "SHA-256",
    enc.encode(secret),
  );
  return globalThis.crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface GuestTokenPayload {
  guestId: string;
  name: string;
  invitationId?: string;
}

/**
 * Encrypts guest information into an opaque URL-safe token (e.g. for `?g=...`).
 * Never reveals the guest's raw name in the query string.
 */
export async function encryptGuestToken(
  payload: GuestTokenPayload,
  invitationId?: string,
): Promise<string> {
  const enc = new TextEncoder();
  const secret = `${SECRET_SALT}:${invitationId || payload.invitationId || "global"}`;
  const key = await getEncryptionKey(secret);

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = enc.encode(
    JSON.stringify({
      gid: payload.guestId,
      n: payload.name,
      inv: payload.invitationId || invitationId,
    }),
  );

  const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return toBase64Url(combined);
}

/**
 * Decrypts a guest token. If the invitationId-specific decryption fails or isn't provided,
 * it safely attempts with the global secret. Returns null if invalid or tampered.
 */
export async function decryptGuestToken(
  token: string,
  invitationId?: string,
): Promise<GuestTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  try {
    const raw = fromBase64Url(token.trim());
    if (raw.length < 13) return null; // Needs at least 12-byte IV + 1 byte payload

    const iv = raw.slice(0, 12);
    const cipherBytes = raw.slice(12);
    const dec = new TextDecoder();

    // Try invitation-scoped secret first if invitationId is given
    const secretsToTry: string[] = [];
    if (invitationId) {
      secretsToTry.push(`${SECRET_SALT}:${invitationId}`);
    }
    secretsToTry.push(`${SECRET_SALT}:global`);

    for (const secret of secretsToTry) {
      try {
        const key = await getEncryptionKey(secret);
        const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          key,
          cipherBytes,
        );
        const jsonStr = dec.decode(decryptedBuffer);
        const data = JSON.parse(jsonStr);
        if (data && typeof data === "object" && data.n) {
          return {
            guestId: data.gid || "",
            name: data.n,
            invitationId: data.inv,
          };
        }
      } catch {
        // Try next secret
      }
    }

    return null;
  } catch {
    return null;
  }
}
