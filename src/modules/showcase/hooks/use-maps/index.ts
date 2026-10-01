import { signal } from '@angular/core';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { MapCamera, MapMarker } from '@/shared/components/native-map/types';
export function useMaps() {
  const initial = { latitude: 37.7749, longitude: -122.4194 };
  const camera = signal<MapCamera>({ coordinates: initial, zoom: 12 });
  const markers = signal<readonly MapMarker[]>([
    { id: 'demo', title: 'Demo marker', coordinates: initial },
  ]);
  const visible = signal(false);
  const reading = signal<string | null>(null);
  const lifecycle = useScreenLifecycle(() => visible.set(false));
  const show = () => {
    lifecycle.assertActive();
    if (Platform.OS === 'android' && !Constants.expoConfig?.extra?.googleMapsConfigured)
      throw new Error(
        'Configure GOOGLE_MAPS_API_KEY and rebuild the Android client to show Google Maps.',
      );
    visible.set(true);
  };
  return {
    map: {
      camera: camera.asReadonly(),
      markers: markers.asReadonly(),
      visible: visible.asReadonly(),
      event: (kind: string, event: unknown) => {
        const parsed = z
          .object({ nativeEvent: z.record(z.string(), z.unknown()) })
          .safeParse(event);
        if (parsed.success)
          reading.set(JSON.stringify({ event: kind, data: parsed.data.nativeEvent }, null, 2));
      },
    },
    reading: reading.asReadonly(),
    ...useNativeTask([
      {
        id: 'show',
        label: 'Show native map',
        run: () => {
          show();
          return 'Native map requested. Pan, zoom or tap a marker to inspect events.';
        },
      },
      {
        id: 'zoom-in',
        label: 'Zoom in',
        run: () => {
          show();
          camera.update((value) => ({ ...value, zoom: Math.min(20, value.zoom + 1) }));
          return camera();
        },
      },
      {
        id: 'zoom-out',
        label: 'Zoom out',
        run: () => {
          show();
          camera.update((value) => ({ ...value, zoom: Math.max(1, value.zoom - 1) }));
          return camera();
        },
      },
      {
        id: 'markers',
        label: 'Toggle example markers',
        run: () => {
          show();
          markers.set(
            markers().length
              ? []
              : [{ id: 'demo', title: 'Demo marker', coordinates: camera().coordinates }],
          );
          return { count: markers().length };
        },
      },
      {
        id: 'location',
        label: 'Center map on current location',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          if (!(await Location.requestForegroundPermissionsAsync()).granted)
            throw new Error('Location permission was denied.');
          const result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!active())
            return 'Location update cancelled because this screen is no longer active.';
          show();
          camera.set({
            coordinates: { latitude: result.coords.latitude, longitude: result.coords.longitude },
            zoom: 15,
          });
          return camera();
        },
      },
      {
        id: 'hide',
        label: 'Hide map',
        run: () => {
          visible.set(false);
          return 'Native map removed.';
        },
      },
    ]),
  };
}
