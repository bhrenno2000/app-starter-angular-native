import type { MMKV } from './types';
import { Buffer } from 'buffer';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv';
import { SECURE_KEYS } from '../keys';
import { getSecureItemSync, setSecureItemSync } from '../secure-storage';

// expoConfig can be null at runtime: the fallback silently changes the id
// and orphans the previous database instead of failing loudly.
const MMKV_ID = `${Constants.expoConfig?.slug ?? 'app'}-storage`;

const ENCRYPTION_KEY_BYTES = 24;

function createEncryptionKey(): string {
  return Buffer.from(Crypto.getRandomBytes(ENCRYPTION_KEY_BYTES)).toString('base64');
}

function readEncryptionKey(): string | null {
  try {
    return getSecureItemSync(SECURE_KEYS.mmkvEncryptionKey);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`MMKV encryption key exists but could not be read: ${reason}`, { cause });
  }
}

function open(encryptionKey: string): MMKV {
  return createMMKV({
    id: MMKV_ID,
    encryptionKey,
    encryptionType: 'AES-256',
    recoveryStrategy: 'recover-on-error',
  });
}

function discardStorage(): void {
  if (!deleteMMKV(MMKV_ID)) {
    throw new Error(`MMKV instance "${MMKV_ID}" is unusable and could not be discarded`);
  }
}

function openStorage(): MMKV {
  const existingKey = readEncryptionKey();

  if (existingKey === null) {
    if (existsMMKV(MMKV_ID)) {
      discardStorage();
    }
  } else {
    try {
      return open(existingKey);
    } catch {
      discardStorage();
    }
  }

  const encryptionKey = createEncryptionKey();
  setSecureItemSync(SECURE_KEYS.mmkvEncryptionKey, encryptionKey);

  return open(encryptionKey);
}

let instance: MMKV | null = null;

export function getStorage(): MMKV {
  instance ??= openStorage();
  return instance;
}
