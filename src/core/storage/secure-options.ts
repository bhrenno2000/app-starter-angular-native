import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS, type SecureKey } from './keys';
const BIOMETRIC_PROMPT = 'Confirme sua identidade para continuar';

export function secureOptions(key: SecureKey): SecureStore.SecureStoreOptions {
  if (key === SECURE_KEYS.mmkvEncryptionKey) {
    return {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    };
  }

  if (key === SECURE_KEYS.biometricCredentials) {
    return {
      keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      requireAuthentication: true,
      authenticationPrompt: BIOMETRIC_PROMPT,
    };
  }

  return {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}
