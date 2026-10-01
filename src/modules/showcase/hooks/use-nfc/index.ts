import { computed, signal } from '@angular/core';
import { Platform, TurboModuleRegistry } from 'react-native';
import { isDevice } from 'expo-device';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { NfcTagPreview, NfcRecordPreview } from './types';
export function useNfc() {
  const scanning = signal(false);
  const tag = signal<NfcTagPreview | null>(null);
  const status = signal('Inspect NFC support or read an NDEF tag on a physical device.');
  let abort: (() => void) | null = null;
  let sdk: typeof import('react-native-nfc-manager') | null = null;
  let requested = false;
  let pending = false;
  let cleanup: Promise<void> = Promise.resolve();
  const close = () => {
    if (!sdk || !requested) return cleanup;
    requested = false;
    const manager = sdk.default;
    cleanup = cleanup
      .catch(() => {})
      .then(() => manager.cancelTechnologyRequest({ throwOnError: true, delayMsAndroid: 0 }))
      .catch(() => {
        status.set('Unable to close the NFC session. Check the system reader before retrying.');
      });
    return cleanup;
  };
  const release = () => {
    abort?.();
    scanning.set(false);
    void close();
  };
  const lifecycle = useScreenLifecycle(release);
  const linked = () => Boolean(TurboModuleRegistry.get('NfcManager'));
  async function client() {
    if (!linked())
      throw new Error('The NFC native module is missing. Rebuild and install the native app.');
    sdk ??= await import('react-native-nfc-manager');
    return sdk;
  }
  async function read() {
    lifecycle.assertActive();
    if (pending)
      throw new Error(
        'The previous NFC request is still closing. Wait before starting another read.',
      );
    if (!isDevice)
      throw new Error('NFC reading requires a physical iOS or Android device and an NDEF tag.');
    const active = lifecycle.checkpoint();
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    scanning.set(true);
    status.set('Hold an NDEF tag near the NFC reader. The session expires after 20 seconds.');
    const cancellation = new Promise<never>((_, reject) => {
      abort = () => {
        cancelled = true;
        reject(new Error('NFC reading cancelled.'));
      };
      timeout = setTimeout(() => {
        cancelled = true;
        reject(new Error('NFC reading timed out after 20 seconds.'));
      }, 20_000);
    });
    const checkpoint = () => {
      if (cancelled || !active())
        throw new Error('NFC reading cancelled because the session or screen changed.');
    };
    pending = true;
    const operation = (async () => {
      await cleanup;
      checkpoint();
      const current = await client();
      checkpoint();
      if (!(await current.default.isSupported(current.NfcTech.Ndef)))
        throw new Error('NDEF reading is not supported by this device.');
      checkpoint();
      if (Platform.OS === 'android' && !(await current.default.isEnabled()))
        throw new Error('NFC is disabled. Enable it in system settings before reading.');
      checkpoint();
      await current.default.start();
      checkpoint();
      requested = true;
      try {
        await current.default.requestTechnology(current.NfcTech.Ndef, {
          alertMessage: 'Hold an NDEF tag near your device.',
          invalidateAfterFirstRead: false,
        });
        checkpoint();
        const found = await current.default.getTag();
        checkpoint();
        if (!found)
          throw new Error('The NFC reader returned no tag. Retry with a compatible NDEF tag.');
        const records: NfcRecordPreview[] = (found.ndefMessage ?? []).slice(0, 16).map((record) => {
          const payload = Uint8Array.from(record.payload ?? []);
          const payloadHex = Array.from(payload.slice(0, 512), (byte) =>
            byte.toString(16).padStart(2, '0'),
          ).join('');
          const type =
            typeof record.type === 'string'
              ? record.type
              : String.fromCharCode(...record.type.slice(0, 128));
          try {
            if (record.tnf === 1 && type === 'T')
              return {
                kind: 'text',
                value: current.Ndef.text.decodePayload(payload).slice(0, 2048),
                payloadHex,
              };
            if (record.tnf === 1 && type === 'U')
              return {
                kind: 'uri',
                value: current.Ndef.uri.decodePayload(payload).slice(0, 2048),
                payloadHex,
              };
            return {
              kind: 'raw',
              value: `TNF ${record.tnf}, type ${type.slice(0, 128)}`,
              payloadHex,
            };
          } catch {
            return {
              kind: 'malformed',
              value: 'The NDEF payload could not be decoded.',
              payloadHex,
            };
          }
        });
        const technology = Reflect.get(found, 'tech');
        const preview: NfcTagPreview = {
          id: found.id ?? null,
          type: found.type ?? null,
          technologies: (
            found.techTypes ?? (typeof technology === 'string' ? [technology] : [])
          ).slice(0, 16),
          records,
          recordsTotal: found.ndefMessage?.length ?? 0,
        };
        tag.set(preview);
        status.set('NDEF tag read. Text and URI records are displayed without opening links.');
        return preview;
      } finally {
        // A late native request must close even after the outer timeout/cancellation wins.
        requested = true;
        await close();
      }
    })().finally(() => {
      pending = false;
    });
    try {
      return await Promise.race([operation, cancellation]);
    } catch (error) {
      status.set(error instanceof Error ? error.message : 'NFC reading could not be completed.');
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
      abort = null;
      scanning.set(false);
      await close();
    }
  }
  return {
    nfc: {
      scanning: scanning.asReadonly(),
      tag: tag.asReadonly(),
      cancel: () => {
        abort?.();
        scanning.set(false);
        status.set('NFC reading cancelled.');
        void close();
      },
    },
    reading: computed(() => status()),
    ...useNativeTask([
      {
        id: 'support',
        label: 'Inspect NFC support',
        run: async () => {
          lifecycle.assertActive();
          const nativeModuleLinked = linked();
          if (!isDevice || !nativeModuleLinked)
            return {
              nativeModuleLinked,
              physicalDevice: isDevice,
              radioCommunicationVerified: false,
              note: nativeModuleLinked
                ? 'Use a physical device for NDEF reading.'
                : 'Rebuild the native app to include NFC.',
            };
          const current = await client();
          return {
            nativeModuleLinked,
            physicalDevice: true,
            ndefSupported: await current.default.isSupported(current.NfcTech.Ndef),
            enabled: Platform.OS === 'android' ? await current.default.isEnabled() : null,
            radioCommunicationVerified: false,
          };
        },
      },
      { id: 'read', label: 'Read NDEF tag for up to 20 seconds', run: read },
      {
        id: 'settings',
        label: 'Open Android NFC settings',
        run: async () => {
          lifecycle.assertActive();
          if (Platform.OS !== 'android')
            throw new Error('NFC settings are available through this action on Android only.');
          if (!isDevice) throw new Error('NFC settings require a physical Android device.');
          const current = await client();
          await current.default.goToNfcSetting();
          return 'Android NFC settings opened.';
        },
      },
    ]),
  };
}
