import * as Biometrics from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useSecurity() {
  return useNativeTask([
    {
      id: 'support',
      label: 'Inspect biometric support',
      run: async () => ({
        hardware: await Biometrics.hasHardwareAsync(),
        enrolled: await Biometrics.isEnrolledAsync(),
        supportedTypes: await Biometrics.supportedAuthenticationTypesAsync(),
      }),
    },
    {
      id: 'authenticate',
      label: 'Authenticate with biometrics',
      run: async () => {
        if (!(await Biometrics.isEnrolledAsync()))
          throw new Error('Enroll Face ID or a fingerprint in device settings first.');
        const result = await Biometrics.authenticateAsync({
          promptMessage: 'Authenticate to unlock the Angular demo',
          disableDeviceFallback: true,
        });
        if (!result.success) throw new Error(`Authentication was not completed: ${result.error}`);
        return 'Biometric authentication succeeded.';
      },
    },
    {
      id: 'save',
      label: 'Save a demo secret',
      run: async () => {
        await SecureStore.setItemAsync('showcase.demo-secret', Crypto.randomUUID(), {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        return 'A random demo secret was saved in device-only secure storage.';
      },
    },
    {
      id: 'read',
      label: 'Check the saved secret',
      run: async () => ({ exists: !!(await SecureStore.getItemAsync('showcase.demo-secret')) }),
    },
    {
      id: 'delete',
      label: 'Delete the demo secret',
      run: async () => {
        await SecureStore.deleteItemAsync('showcase.demo-secret');
        return 'Demo secret deleted.';
      },
    },
    {
      id: 'hash',
      label: 'Generate SHA-256 digest',
      run: () =>
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, 'Angular Native showcase'),
    },
  ]);
}
