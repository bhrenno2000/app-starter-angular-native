import { utf8ByteLength } from '@/shared/utils/bytes';
import * as SecureStore from 'expo-secure-store';
import type { SecureKey } from './types';
import { secureOptions } from '../secure-options';

const VALUE_LIMIT_BYTES = 2048;

function assertWithinLimit(key: SecureKey, value: string): void {
  const bytes = utf8ByteLength(value);

  if (bytes > VALUE_LIMIT_BYTES) {
    throw new Error(
      `Key "${key}" received ${bytes} bytes, exceeding the SecureStore limit of ${VALUE_LIMIT_BYTES} bytes. ` +
        'SecureStore stores one secret per key. Use MMKV for aggregate values.',
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
