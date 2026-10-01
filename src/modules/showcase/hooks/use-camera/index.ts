import type { CameraFacing } from '@/shared/components/native-camera/types';
import { signal } from '@angular/core';
import { Camera } from 'expo-camera';
import { useBundledAsset } from '@/core/hooks/use-bundled-asset';
import * as Picker from 'expo-image-picker';
import * as Device from 'expo-device';
import { z } from 'zod';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
export function useCamera() {
  const visible = signal(false);
  const facing = signal<CameraFacing>('back');
  const torch = signal(false);
  const reading = signal<string | null>(null);
  const preview = signal<string | null>(null);
  const lifecycle = useScreenLifecycle(() => {
    visible.set(false);
    torch.set(false);
  });
  const scan = async (uri: string) => {
    const active = lifecycle.checkpoint();
    const codes = await Camera.scanFromURLAsync(uri, ['qr']);
    if (!active()) return 'Scanning cancelled because this screen is no longer active.';
    preview.set(uri);
    const result = codes.map(({ type, data }) => ({ type, data }));
    reading.set(JSON.stringify(result, null, 2));
    return result.length ? result : 'No QR code was found in this image.';
  };
  return {
    camera: {
      visible: visible.asReadonly(),
      facing: facing.asReadonly(),
      torch: torch.asReadonly(),
      scanned: (event: unknown) => {
        const code = z
          .object({ nativeEvent: z.object({ type: z.string(), data: z.string().max(8192) }) })
          .safeParse(event);
        if (!code.success) return;
        reading.set(JSON.stringify(code.data.nativeEvent, null, 2));
        visible.set(false);
        torch.set(false);
      },
      ready: () => reading.set('Camera ready. Point it at a QR code or barcode.'),
      failed: (event: unknown) => {
        visible.set(false);
        torch.set(false);
        const failure = z
          .object({ nativeEvent: z.object({ message: z.string() }) })
          .safeParse(event);
        reading.set(
          failure.success ? failure.data.nativeEvent.message : 'The camera could not be started.',
        );
      },
    },
    preview: preview.asReadonly(),
    reading: reading.asReadonly(),
    ...useNativeTask([
      {
        id: 'start',
        label: 'Start live barcode scanner',
        run: async () => {
          lifecycle.assertActive();
          if (!Device.isDevice)
            throw new Error(
              'The live camera requires a physical device. Use Scan bundled QR image in the simulator.',
            );
          const active = lifecycle.checkpoint();
          if (!(await Camera.requestCameraPermissionsAsync()).granted)
            throw new Error('Camera permission was denied.');
          if (!active())
            return 'Camera activation cancelled because this screen is no longer active.';
          visible.set(true);
          return 'Starting the live scanner. Wait for Camera ready before scanning.';
        },
      },
      {
        id: 'stop',
        label: 'Stop live scanner',
        run: () => {
          visible.set(false);
          torch.set(false);
          return 'Camera removed.';
        },
      },
      {
        id: 'switch',
        label: 'Switch camera',
        run: () => {
          facing.update((value) => (value === 'back' ? 'front' : 'back'));
          return { facing: facing() };
        },
      },
      {
        id: 'torch',
        label: 'Toggle camera torch',
        run: () => {
          if (!visible() || facing() !== 'back')
            throw new Error('Start the back camera before using the torch.');
          torch.update((value) => !value);
          return { torch: torch() };
        },
      },
      {
        id: 'fixture',
        label: 'Scan bundled QR image',
        run: async () => {
          const uri = await useBundledAsset(
            require('../../../../../assets/images/native/qr-code.png'),
          );
          return scan(uri);
        },
      },
      {
        id: 'image',
        label: 'Scan QR from selected photo',
        run: async () => {
          const result = await Picker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
          });
          if (result.canceled) return 'Selection cancelled.';
          return scan(result.assets[0].uri);
        },
      },
    ]),
  };
}
