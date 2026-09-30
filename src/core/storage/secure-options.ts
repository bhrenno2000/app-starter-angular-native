import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS, type SecureKey } from './keys';

export function secureOptions(key: SecureKey): SecureStore.SecureStoreOptions {
  if (key === SECURE_KEYS.mmkvEncryptionKey) {
    return {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    };
  }

  return {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}
