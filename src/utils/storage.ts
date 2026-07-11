import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'studyhub_local_secure_key';

const KEYS = {
  ACCESS_TOKEN:  'sh_access_token',
  REFRESH_TOKEN: 'sh_refresh_token',
  DEVICE_UUID:   'sh_device_uuid',
  USER_ID:       'sh_user_id',
  SCHOOL_ID:     'sh_school_id',
  LAST_LOGIN:    'sh_last_login',
} as const;

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

async function set(key: StorageKey, value: string): Promise<void> {
  try {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    await AsyncStorage.setItem(key, encrypted);
  } catch (e) {
    console.error(`[Storage] Failed to set ${key}`, e);
  }
}

async function get(key: StorageKey): Promise<string | null> {
  try {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || encrypted;
    } catch (e) {
      return encrypted;
    }
  } catch (e) {
    console.error(`[Storage] Failed to get ${key}`, e);
    return null;
  }
}

async function remove(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`[Storage] Failed to remove ${key}`, e);
  }
}

async function clearAll(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => remove(k as StorageKey)));
}

export const storage = { set, get, remove, clearAll, KEYS };
