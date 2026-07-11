import { storage } from './storage';
import * as Crypto from 'expo-crypto';

/**
 * Returns the SHA-256 hash of the device UUID.
 * The raw UUID is stored securely; only the hash is transmitted in X-Device-Id.
 */
export async function getDeviceFingerprint(): Promise<string> {
  let uuid = await storage.get(storage.KEYS.DEVICE_UUID);

  if (!uuid) {
    // Generate a stable UUID for this installation
    uuid = generateUUID();
    await storage.set(storage.KEYS.DEVICE_UUID, uuid);
  }

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    uuid
  );

  return hash;
}

function generateUUID(): string {
  // RFC 4122 compliant UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
