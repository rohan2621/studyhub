import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

export const storage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync("deviceId");
  if (!deviceId) {
    // Use expo-crypto for a cryptographically secure UUID
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync("deviceId", deviceId);
  }
  return deviceId;
}