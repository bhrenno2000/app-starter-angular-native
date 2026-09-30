export const SECURE_KEYS = {
  mmkvEncryptionKey: 'mmkv.encryptionKey',
  refreshToken: 'auth.refreshToken',
  biometricCredentials: 'auth.biometricCredentials',
} as const;

type StaticSecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

const DEVICE_SECRET_PREFIX = 'device.secret.';

type DeviceSecretKey = `${typeof DEVICE_SECRET_PREFIX}${string}`;

export const deviceSecretKey = (deviceId: string): DeviceSecretKey =>
  `${DEVICE_SECRET_PREFIX}${deviceId}`;

export type SecureKey = StaticSecureKey | DeviceSecretKey;

export const MMKV_KEYS = {
  userStore: 'store.user',
  themeStore: 'store.theme',
  deviceSecretIndex: 'device.secretIndex',
  biometricProfile: 'auth.biometricProfile',
} as const;

export type MmkvKey = (typeof MMKV_KEYS)[keyof typeof MMKV_KEYS];
