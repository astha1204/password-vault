// src/utils/crypto.ts
const enc = new TextEncoder();
const dec = new TextDecoder();

export const ITERATIONS = 200_000; // balance speed/security
export const SALT_BYTES = 16;
export const IV_BYTES = 12;

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Generate random base64 salt (for PBKDF2)
export function generateSaltBase64() {
  const s = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return arrayBufferToBase64(s.buffer);
}

// Derive CryptoKey from password and salt
export async function deriveKeyFromPassword(password: string, saltBase64: string) {
  const salt = base64ToArrayBuffer(saltBase64);
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  const derived = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return derived;
}

// Encrypt JSON object, returns ciphertext and iv base64 strings
export async function encryptJSON(obj: any, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    ciphertext: arrayBufferToBase64(ct),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

// Decrypt ciphertext + iv to original JSON object
export async function decryptToJSON(ciphertextBase64: string, ivBase64: string, key: CryptoKey) {
  const ctBuf = base64ToArrayBuffer(ciphertextBase64);
  const ivBuf = base64ToArrayBuffer(ivBase64);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, key, ctBuf);
  const json = dec.decode(plainBuf);
  return JSON.parse(json);
}
