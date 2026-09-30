import type { AppStorage, SecureKey } from './types';
import { getStorage } from '../mmkv';
import { deleteSecureItem, getSecureItem, setSecureItem } from '../secure-storage';
export const nativeStorage: AppStorage = {
  get: (key) => getStorage().getString(key) ?? null,
  set: (key, value) => getStorage().set(key, value),
  remove: (key) => getStorage().remove(key),
  getSecret: (key) => getSecureItem(key as SecureKey),
  setSecret: (key, value) => setSecureItem(key as SecureKey, value),
  removeSecret: (key) => deleteSecureItem(key as SecureKey),
};
