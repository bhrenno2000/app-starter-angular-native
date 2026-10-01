import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { defineBackgroundLocation, stopBackgroundLocation, useBackgroundLocation } from './index';
const native = vi.hoisted(() => ({
  running: false,
  enabled: false,
  platform: { OS: 'ios' },
  define: vi.fn(),
  defined: vi.fn(),
  available: vi.fn(),
  foreground: vi.fn(),
  background: vi.fn(),
  services: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  alert: vi.fn(),
  open: vi.fn(),
  db: {
    execAsync: vi.fn(),
    runAsync: vi.fn(),
    withTransactionAsync: vi.fn(),
    getAllAsync: vi.fn(),
    getFirstAsync: vi.fn(),
    closeAsync: vi.fn(),
  },
}));
vi.mock('react-native', () => ({
  Platform: native.platform,
  Alert: { alert: native.alert },
  Linking: { openSettings: vi.fn() },
}));
vi.mock('expo-device', () => ({ isDevice: true }));
vi.mock('expo-task-manager', () => ({
  defineTask: native.define,
  isTaskDefined: native.defined,
  isAvailableAsync: native.available,
}));
vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: native.foreground,
  requestBackgroundPermissionsAsync: native.background,
  hasServicesEnabledAsync: native.services,
  hasStartedLocationUpdatesAsync: async () => native.running,
  startLocationUpdatesAsync: native.start,
  stopLocationUpdatesAsync: native.stop,
  Accuracy: { Balanced: 3 },
}));
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: native.open }));
@Component({ template: '' })
class Host {
  readonly demo = useBackgroundLocation();
}
afterEach(async () => {
  cleanup();
  native.stop.mockImplementation(async () => {
    native.running = false;
  });
  await stopBackgroundLocation();
});
beforeEach(() => {
  vi.resetAllMocks();
  native.running = false;
  native.enabled = false;
  native.platform.OS = 'ios';
  native.defined.mockReturnValue(true);
  native.available.mockResolvedValue(true);
  native.services.mockResolvedValue(true);
  native.foreground.mockResolvedValue({ granted: true });
  native.background.mockResolvedValue({ granted: true });
  native.start.mockImplementation(async () => {
    native.running = true;
  });
  native.stop.mockImplementation(async () => {
    native.running = false;
  });
  native.open.mockResolvedValue(native.db);
  native.db.execAsync.mockResolvedValue(undefined);
  native.db.runAsync.mockImplementation(async (sql: string, ...args: unknown[]) => {
    if (sql.startsWith('INSERT INTO tracking_settings')) native.enabled = args[0] === 1;
    return { changes: 1 };
  });
  native.db.getFirstAsync.mockImplementation(async () => ({ enabled: native.enabled ? 1 : 0 }));
  native.db.closeAsync.mockResolvedValue(undefined);
  native.db.getAllAsync.mockResolvedValue([]);
  native.db.withTransactionAsync.mockImplementation(async (operation: () => Promise<void>) =>
    operation(),
  );
});
async function setup(front = signal(true)) {
  const result = await render(Host, {
    providers: [
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active: signal(true) } },
    ],
  });
  return { demo: result.componentRef.instance.demo, detectChanges: result.detectChanges };
}
function callback() {
  native.defined.mockReturnValue(false);
  defineBackgroundLocation();
  native.defined.mockReturnValue(true);
  return native.define.mock.calls[0][1];
}
const point = { timestamp: 1000, coords: { latitude: 12.34, longitude: 56.78, accuracy: 5 } };
test('foreground denial prevents background permission and native activation', async () => {
  native.foreground.mockResolvedValue({ granted: false });
  const { demo } = await setup();
  await demo.perform('start');
  expect(demo.error()).toContain('Foreground');
  expect(native.background).not.toHaveBeenCalled();
  expect(native.start).not.toHaveBeenCalled();
});
test('background denial reports settings guidance without starting the service', async () => {
  native.background.mockResolvedValue({ granted: false });
  const { demo } = await setup();
  await demo.perform('start');
  expect(demo.error()).toContain('Allow Once');
  expect(native.start).not.toHaveBeenCalled();
});
test('a permission grant after screen loss cannot start hidden tracking', async () => {
  let grant: ((value: { granted: boolean }) => void) | undefined;
  native.background.mockImplementation(
    () =>
      new Promise((resolve) => {
        grant = resolve;
      }),
  );
  const front = signal(true);
  const { demo, detectChanges } = await setup(front);
  const pending = demo.perform('start');
  await vi.waitFor(() => expect(native.background).toHaveBeenCalled());
  front.set(false);
  await detectChanges();
  grant?.({ granted: true });
  await pending;
  expect(native.start).not.toHaveBeenCalled();
  expect(demo.error()).toContain('cancelled');
});
test('session cleanup invalidates a pending permission grant', async () => {
  let grant: ((value: { granted: boolean }) => void) | undefined;
  native.background.mockImplementation(
    () =>
      new Promise((resolve) => {
        grant = resolve;
      }),
  );
  const { demo } = await setup();
  const pending = demo.perform('start');
  await vi.waitFor(() => expect(native.background).toHaveBeenCalled());
  await stopBackgroundLocation();
  grant?.({ granted: true });
  await pending;
  expect(native.start).not.toHaveBeenCalled();
  expect(demo.error()).toContain('session changed');
});
test('late native activation is released after screen loss', async () => {
  let finish: (() => void) | undefined;
  native.start.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = () => {
          native.running = true;
          resolve();
        };
      }),
  );
  const front = signal(true);
  const { demo, detectChanges } = await setup(front);
  const pending = demo.perform('start');
  await vi.waitFor(() => expect(native.start).toHaveBeenCalled());
  front.set(false);
  await detectChanges();
  finish?.();
  await pending;
  expect(native.stop).toHaveBeenCalledOnce();
  expect(native.running).toBe(false);
  expect(demo.error()).toContain('Late');
});
test('native callback persists counts only, exposes memory coordinates and clears them on stop', async () => {
  const execute = callback();
  const { demo } = await setup();
  await demo.perform('start');
  await execute({ data: { locations: [point] }, error: null });
  expect(JSON.parse(demo.reading()).latestLocation).toMatchObject({
    latitude: 12.34,
    longitude: 56.78,
  });
  expect(
    native.db.runAsync.mock.calls
      .find((call) => String(call[0]).startsWith('INSERT INTO arrivals'))
      ?.slice(1),
  ).toEqual([expect.any(String), 1]);
  expect(native.db.closeAsync).toHaveBeenCalledTimes(native.open.mock.calls.length);
  await demo.perform('stop');
  expect(JSON.parse(demo.reading()).latestLocation).toBeNull();
});
test('invalid and post-stop payloads cannot update coordinates or write history', async () => {
  const execute = callback();
  const { demo } = await setup();
  await demo.perform('start');
  native.open.mockClear();
  await execute({
    data: { locations: [{ ...point, coords: { ...point.coords, latitude: 100 } }] },
    error: null,
  });
  expect(native.open).not.toHaveBeenCalled();
  await demo.perform('stop');
  native.open.mockClear();
  await execute({ data: { locations: [point] }, error: null });
  expect(native.open).not.toHaveBeenCalled();
});
test('failed native stop blocks delivery and presents actionable cleanup failure', async () => {
  const execute = callback();
  const { demo } = await setup();
  await demo.perform('start');
  native.stop.mockRejectedValue(new Error('Native stop failed'));
  await demo.perform('stop');
  expect(demo.error()).toContain('Native stop failed');
  expect(native.alert).toHaveBeenCalled();
  native.open.mockClear();
  await execute({ data: { locations: [point] }, error: null });
  expect(native.open).not.toHaveBeenCalled();
});
test('Android tracking requests a visible foreground service', async () => {
  native.platform.OS = 'android';
  const { demo } = await setup();
  await demo.perform('start');
  expect(native.start).toHaveBeenCalledWith(
    'angular-native-showcase-location-v1',
    expect.objectContaining({
      foregroundService: expect.objectContaining({ notificationTitle: 'Angular Native location' }),
    }),
  );
});

test('a fresh runtime does not process a callback after failed stop without durable opt-in', async () => {
  const { demo } = await setup();
  await demo.perform('start');
  native.stop.mockRejectedValue(new Error('Native stop failed'));
  await demo.perform('stop');
  vi.resetModules();
  native.define.mockClear();
  native.defined.mockReturnValue(false);
  const fresh = await import('./index');
  fresh.defineBackgroundLocation();
  native.defined.mockReturnValue(true);
  native.db.runAsync.mockClear();
  await native.define.mock.calls[0][1]({ data: { locations: [point] }, error: null });
  expect(
    native.db.runAsync.mock.calls.filter((call) =>
      String(call[0]).startsWith('INSERT INTO arrivals'),
    ),
  ).toHaveLength(0);
});

test('failed opt-out persistence still attempts to stop native tracking', async () => {
  const { demo } = await setup();
  await demo.perform('start');
  native.db.runAsync.mockRejectedValue(new Error('Intent write failed'));
  await demo.perform('stop');
  expect(native.stop).toHaveBeenCalled();
  expect(native.running).toBe(false);
  expect(demo.error()).toContain('Intent write failed');
  native.db.runAsync.mockResolvedValue({ changes: 1 });
});
