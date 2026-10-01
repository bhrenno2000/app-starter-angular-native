import { computed, signal } from '@angular/core';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SQLite from 'expo-sqlite';
import { isDevice } from 'expo-device';
import { z } from 'zod';
import { useNativeTask } from '../use-native-task';
import { useScreenLifecycle } from '../use-screen-lifecycle';
import type { BackgroundCoordinate, LocationArrival, LocationTrackingState } from './types';
const taskName = 'angular-native-showcase-location-v1';
const latest = signal<BackgroundCoordinate | null>(null);
const status = signal(
  'Tracking continues beyond this screen until stopped or signed out. Coordinates stay in memory; history stores only arrival times and sample counts.',
);
let generation = 0;
let deliveryBlocked = false;
let transition: Promise<void> = Promise.resolve();
let preferenceTransition: Promise<void> = Promise.resolve();
const payload = z.object({
  locations: z
    .array(
      z.object({
        timestamp: z.number().finite(),
        coords: z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
          accuracy: z.number().finite().nullable(),
        }),
      }),
    )
    .max(1000),
});
function serialized(action: () => Promise<void>) {
  const job = transition.catch(() => {}).then(action);
  transition = job.catch(() => {});
  return job;
}
async function database() {
  const db = await SQLite.openDatabaseAsync('showcase-location-arrivals.sqlite', {
    useNewConnection: true,
  });
  try {
    await db.execAsync(
      'PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS arrivals (id INTEGER PRIMARY KEY AUTOINCREMENT, receivedAt TEXT NOT NULL, samples INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS tracking_settings (id INTEGER PRIMARY KEY CHECK (id = 1), enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)))',
    );
    return db;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}
function setDesiredTracking(enabled: boolean) {
  const pending = preferenceTransition
    .catch(() => {})
    .then(async () => {
      const db = await database();
      try {
        await db.runAsync(
          'INSERT INTO tracking_settings (id, enabled) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled',
          enabled ? 1 : 0,
        );
      } finally {
        await db.closeAsync();
      }
    });
  preferenceTransition = pending.catch(() => {});
  return pending;
}
async function desiredTracking() {
  await preferenceTransition;
  const db = await database();
  try {
    return (
      (
        await db.getFirstAsync<LocationTrackingState>(
          'SELECT enabled FROM tracking_settings WHERE id = 1',
        )
      )?.enabled === 1
    );
  } finally {
    await db.closeAsync();
  }
}
async function record(samples: number) {
  const db = await database();
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT INTO arrivals (receivedAt, samples) VALUES (?, ?)',
        new Date().toISOString(),
        samples,
      );
      await db.runAsync(
        'DELETE FROM arrivals WHERE id NOT IN (SELECT id FROM arrivals ORDER BY id DESC LIMIT 50)',
      );
    });
  } finally {
    await db.closeAsync();
  }
}
export function defineBackgroundLocation() {
  if (TaskManager.isTaskDefined(taskName)) return;
  TaskManager.defineTask(taskName, async ({ data, error }) => {
    if (deliveryBlocked) return;
    const epoch = generation;
    if (error) {
      status.set(
        'The native location task reported an error. Inspect permissions and tracking status.',
      );
      return;
    }
    const parsed = payload.safeParse(data);
    if (!parsed.success) {
      status.set('The native location payload was invalid.');
      return;
    }
    if (!(await Location.hasStartedLocationUpdatesAsync(taskName)) || epoch !== generation) return;
    const points = parsed.data.locations;
    if (!points.length) return;
    try {
      if (!(await desiredTracking())) {
        await serialized(async () => {
          if (
            !(await desiredTracking()) &&
            (await Location.hasStartedLocationUpdatesAsync(taskName))
          )
            await Location.stopLocationUpdatesAsync(taskName);
        });
        return;
      }
      if (epoch !== generation || deliveryBlocked) return;
      await record(points.length);
      if (epoch !== generation || deliveryBlocked) return;
      const point = points[points.length - 1];
      latest.set({
        latitude: point.coords.latitude,
        longitude: point.coords.longitude,
        accuracy:
          point.coords.accuracy !== null && point.coords.accuracy >= 0
            ? point.coords.accuracy
            : null,
        timestamp: point.timestamp,
      });
      status.set(
        `Native location callback received ${points.length} samples. Physical-device background behavior remains to be verified.`,
      );
    } catch {
      status.set('The callback arrived but its metadata could not be recorded.');
    }
  });
}
export function stopBackgroundLocation() {
  generation++;
  deliveryBlocked = true;
  latest.set(null);
  const optOut = setDesiredTracking(false);
  return serialized(async () => {
    try {
      try {
        await optOut;
      } finally {
        if (await Location.hasStartedLocationUpdatesAsync(taskName))
          await Location.stopLocationUpdatesAsync(taskName);
      }
      status.set('Background location tracking stopped. In-memory coordinates cleared.');
    } catch (error) {
      status.set(
        'Background location cleanup was incomplete. Disable location access in Settings.',
      );
      Alert.alert('Location cleanup failed', status());
      throw error;
    }
  });
}
export function useBackgroundLocation() {
  const lifecycle = useScreenLifecycle(() => {});
  return {
    reading: computed(() =>
      JSON.stringify({ status: status(), latestLocation: latest() }, null, 2),
    ),
    ...useNativeTask([
      {
        id: 'inspect',
        label: 'Inspect background location',
        run: async () => ({
          defined: TaskManager.isTaskDefined(taskName),
          tracking: await Location.hasStartedLocationUpdatesAsync(taskName),
          desiredTracking: await desiredTracking(),
          foregroundPermission: await Location.getForegroundPermissionsAsync(),
          backgroundPermission: await Location.getBackgroundPermissionsAsync(),
          servicesEnabled: await Location.hasServicesEnabledAsync(),
          physicalDevice: isDevice,
          physicalBackgroundReceptionVerified: false,
        }),
      },
      {
        id: 'start',
        label: 'Start background location tracking',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const epoch = generation;
          const check = () => {
            if (!active() || epoch !== generation)
              throw new Error(
                'Location activation cancelled because the screen or session changed.',
              );
          };
          if (!(await TaskManager.isAvailableAsync()))
            throw new Error('The native task manager is unavailable. Rebuild the app.');
          check();
          if (!TaskManager.isTaskDefined(taskName))
            throw new Error('The location task was not defined at bundle startup.');
          if (!(await Location.hasServicesEnabledAsync()))
            throw new Error('Location services are disabled. Enable them in system settings.');
          check();
          if (!(await Location.requestForegroundPermissionsAsync()).granted)
            throw new Error('Foreground location permission was denied.');
          check();
          if (!(await Location.requestBackgroundPermissionsAsync()).granted)
            throw new Error(
              'Background location permission was denied. Enable Always on iOS or background access on Android in Settings. An iOS Allow Once grant cannot be upgraded in the same session.',
            );
          check();
          await serialized(async () => {
            check();
            deliveryBlocked = true;
            await Location.startLocationUpdatesAsync(taskName, {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 50,
              timeInterval: 10_000,
              pausesUpdatesAutomatically: true,
              showsBackgroundLocationIndicator: true,
              ...(Platform.OS === 'android'
                ? {
                    foregroundService: {
                      notificationTitle: 'Angular Native location',
                      notificationBody:
                        'Location demonstration is active. Open the showcase to stop it.',
                      killServiceOnDestroy: true,
                    },
                  }
                : {}),
            });
            if (!active() || epoch !== generation) {
              await Location.stopLocationUpdatesAsync(taskName);
              throw new Error(
                'Late location activation released because the screen or session changed.',
              );
            }
            try {
              await setDesiredTracking(true);
              check();
            } catch (error) {
              try {
                await setDesiredTracking(false);
              } finally {
                await Location.stopLocationUpdatesAsync(taskName);
              }
              throw error;
            }
            deliveryBlocked = false;
            status.set(
              'Background tracking started. Stop it explicitly or sign out to release it. System termination and battery policies can stop delivery.',
            );
          });
          return {
            tracking: await Location.hasStartedLocationUpdatesAsync(taskName),
            physicalDevice: isDevice,
            physicalBackgroundReceptionVerified: false,
          };
        },
      },
      {
        id: 'stop',
        label: 'Stop background location tracking',
        run: async () => {
          await stopBackgroundLocation();
          return { tracking: false };
        },
      },
      {
        id: 'history',
        label: 'Read location callback history',
        run: async () => {
          const db = await database();
          try {
            return await db.getAllAsync<LocationArrival>(
              'SELECT id, receivedAt, samples FROM arrivals ORDER BY id DESC LIMIT 50',
            );
          } finally {
            await db.closeAsync();
          }
        },
      },
      {
        id: 'settings',
        label: 'Open location permission settings',
        run: () => Linking.openSettings(),
      },
    ]),
  };
}
