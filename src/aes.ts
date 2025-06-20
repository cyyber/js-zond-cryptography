import { gcm } from "@noble/ciphers/aes";
import type { CipherWithOutput } from "@noble/ciphers/utils";

function getCipher(
  key: Uint8Array,
  iv: Uint8Array,
  mode: string
): CipherWithOutput {
  if (!mode.startsWith("aes-")) {
    throw new Error("AES: unsupported mode");
  }
  const len = key.length;
  if (
    (mode.startsWith("aes-256") && len !== 32)
  ) {
    throw new Error("AES: wrong key length");
  }
  if (iv.length !== 12) {
    throw new Error("AES: wrong IV length");
  }
  if (["aes-256-gcm"].includes(mode)) {
    return gcm(key, iv);
  }
  throw new Error("AES: unsupported mode");
}

export function encrypt(
  msg: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  mode = "aes-256-gcm"
): Uint8Array {
  return getCipher(key, iv, mode).encrypt(msg);
}

export function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  mode = "aes-256-gcm"
): Uint8Array {
  return getCipher(key, iv, mode).decrypt(ciphertext);
}
