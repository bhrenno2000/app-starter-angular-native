import { utf8ByteLength } from '@/shared/utils/bytes';
import * as SecureStore from 'expo-secure-store';
import type { SecureKey } from './keys';
import { secureOptions } from './secure-options';

const VALUE_LIMIT_BYTES = 2048;

function assertWithinLimit(key: SecureKey, value: string): void {
  const bytes = utf8ByteLength(value);

  if (bytes > VALUE_LIMIT_BYTES) {
    throw new Error(
      `A chave "${key}" recebeu ${bytes} bytes, acima do limite de ${VALUE_LIMIT_BYTES} do SecureStore. ` +
        'SecureStore guarda um segredo por chave, nunca um agregado — use o MMKV para este valor.',
    );
  }
}

export function getSecureItem(key: SecureKey): Promise<string | null> {
  return SecureStore.getItemAsync(key, secureOptions(key));
}

export function getSecureItemSync(key: SecureKey): string | null {
  return SecureStore.getItem(key, secureOptions(key));
}

export async function setSecureItem(key: SecureKey, value: string): Promise<void> {
  assertWithinLimit(key, value);
  await SecureStore.setItemAsync(key, value, secureOptions(key));
}

export function setSecureItemSync(key: SecureKey, value: string): void {
  assertWithinLimit(key, value);
  SecureStore.setItem(key, value, secureOptions(key));
}

export async function deleteSecureItem(key: SecureKey): Promise<void> {
  await SecureStore.deleteItemAsync(key, secureOptions(key));
}
