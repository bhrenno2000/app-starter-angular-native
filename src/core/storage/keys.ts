export const SECURE_KEYS = {
  mmkvEncryptionKey: 'mmkv.encryptionKey',
  refreshToken: 'auth.refreshToken',
} as const;

export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

export const MMKV_KEYS = {
  userStore: 'store.user',
  themeStore: 'store.theme',
} as const;

export type MmkvKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS];
