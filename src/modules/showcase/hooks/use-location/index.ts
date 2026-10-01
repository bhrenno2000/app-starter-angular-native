import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import { signal } from '@angular/core';
import * as Location from 'expo-location';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useLocation() {
  const coordinates = signal<string | null>(null);
  let subscription: Location.LocationSubscription | null = null;
  const stop = () => {
    subscription?.remove();
    subscription = null;
    return 'Location tracking stopped.';
  };
  const lifecycle = useScreenLifecycle(stop);
  const permit = async () => {
    if (!(await Location.requestForegroundPermissionsAsync()).granted)
      throw new Error('Location permission was denied.');
  };
  return {
    coordinates: coordinates.asReadonly(),
    ...useNativeTask([
      {
        id: 'current',
        label: 'Get current location',
        run: async () => {
          await permit();
          const result = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coordinates.set(JSON.stringify(result.coords));
          return result.coords;
        },
      },
      {
        id: 'watch',
        label: 'Start foreground tracking',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          await permit();
          if (!active()) return 'Tracking cancelled because this screen is no longer active.';
          stop();
          const created = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
            (result) => coordinates.set(JSON.stringify(result.coords)),
          );
          if (!active()) {
            created.remove();
            return 'Tracking cancelled because this screen is no longer active.';
          }
          subscription = created;
          return 'Foreground tracking started. It stops when you leave this page.';
        },
      },
      { id: 'stop', label: 'Stop tracking', run: stop },
      {
        id: 'services',
        label: 'Inspect location services',
        run: () => Location.getProviderStatusAsync(),
      },
    ]),
  };
}
