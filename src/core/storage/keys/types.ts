import type { MMKV_KEYS, SECURE_KEYS } from './index';

export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];
export type MmkvKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS];
