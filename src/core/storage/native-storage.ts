import type { AppStorage } from './app-storage';
import { getStorage } from './mmkv';
import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';
import type { SecureKey } from './keys';
export const nativeStorage: AppStorage = {
  get: (key) => getStorage().getString(key) ?? null,
  set: (key, value) => getStorage().set(key, value),
  remove: (key) => getStorage().remove(key),
  getSecret: (key) => getSecureItem(key as SecureKey),
  setSecret: (key, value) => setSecureItem(key as SecureKey, value),
  removeSecret: (key) => deleteSecureItem(key as SecureKey),
};
