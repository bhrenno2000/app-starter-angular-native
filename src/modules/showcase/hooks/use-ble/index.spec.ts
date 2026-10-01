import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useBle } from './index';
const native = vi.hoisted(() => ({
  device: { isDevice: true },
  create: vi.fn(),
  platform: { OS: 'ios', Version: 26.5 },
  requestPermissions: vi.fn(),
  client: {
    state: vi.fn(),
    onStateChange: vi.fn(),
    startDeviceScan: vi.fn(),
    stopDeviceScan: vi.fn(),
    destroy: vi.fn(),
    connectToDevice: vi.fn(),
    cancelDeviceConnection: vi.fn(),
    cancelTransaction: vi.fn(),
    onDeviceDisconnected: vi.fn(),
    discoverAllServicesAndCharacteristicsForDevice: vi.fn(),
    servicesForDevice: vi.fn(),
    characteristicsForDevice: vi.fn(),
    readCharacteristicForDevice: vi.fn(),
    monitorCharacteristicForDevice: vi.fn(),
  },
  removeMonitor: vi.fn(),
  removeDisconnect: vi.fn(),
}));
vi.mock('expo-device', () => native.device);
vi.mock('react-native', () => ({
  Platform: native.platform,
  NativeModules: { BlePlx: {} },
  PermissionsAndroid: {
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'scan',
      BLUETOOTH_CONNECT: 'connect',
      ACCESS_FINE_LOCATION: 'fine',
      ACCESS_COARSE_LOCATION: 'coarse',
    },
    RESULTS: { GRANTED: 'granted' },
    requestMultiple: native.requestPermissions,
  },
}));
vi.mock('react-native-ble-plx', () => ({
  BleManager: vi.fn(function () {
    native.create();
    return native.client;
  }),
  State: {
    PoweredOn: 'PoweredOn',
    PoweredOff: 'PoweredOff',
    Unknown: 'Unknown',
    Resetting: 'Resetting',
  },
}));
@Component({ selector: 'test-ble', template: '' })
class Host {
  readonly demo = useBle();
}
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  native.device.isDevice = true;
  native.platform.OS = 'ios';
  native.client.state.mockResolvedValue('PoweredOn');
  for (const method of [
    native.client.startDeviceScan,
    native.client.stopDeviceScan,
    native.client.destroy,
    native.client.cancelDeviceConnection,
    native.client.cancelTransaction,
    native.client.discoverAllServicesAndCharacteristicsForDevice,
  ])
    method.mockResolvedValue(undefined);
  native.client.connectToDevice.mockResolvedValue({ id: 'peer-1' });
  native.client.onDeviceDisconnected.mockReturnValue({ remove: native.removeDisconnect });
  native.client.monitorCharacteristicForDevice.mockReturnValue({ remove: native.removeMonitor });
  native.client.servicesForDevice.mockResolvedValue([{ uuid: 'service-1' }]);
  native.client.characteristicsForDevice.mockResolvedValue([
    { uuid: 'field-1', isReadable: true, isNotifiable: true, isIndicatable: false },
  ]);
  native.client.readCharacteristicForDevice.mockResolvedValue({ value: 'AQ==' });
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
async function scanned() {
  const result = await setup();
  await result.demo.perform('scan');
  const emit = native.client.startDeviceScan.mock.calls[0][2];
  emit(null, { id: 'peer-1', name: 'Test peripheral', rssi: -40 });
  result.demo.ble.select('peer-1');
  return { ...result, emit };
}
test('simulator capability output never claims radio verification or creates a manager', async () => {
  native.device.isDevice = false;
  const { demo } = await setup();
  await demo.perform('adapter');
  expect(JSON.parse(demo.output()).radioCommunicationVerified).toBe(false);
  await demo.perform('scan');
  expect(demo.error()).toContain('physical');
  expect(native.create).not.toHaveBeenCalled();
});
test('deduplicates advertisements and ignores events after screen suspension', async () => {
  const front = signal(true);
  const { demo, detectChanges } = await setup(front);
  await demo.perform('scan');
  const emit = native.client.startDeviceScan.mock.calls[0][2];
  emit(null, { id: 'peer-1', name: 'Test peripheral', rssi: -60 });
  emit(null, { id: 'peer-1', name: 'Test peripheral', rssi: -40 });
  expect(demo.ble.devices()).toHaveLength(1);
  expect(demo.ble.devices()[0].rssi).toBe(-40);
  front.set(false);
  await detectChanges();
  await Promise.resolve();
  emit(null, { id: 'late-peer', name: 'Late', rssi: -10 });
  expect(demo.ble.devices()).toHaveLength(1);
  expect(demo.ble.scanning()).toBe(false);
  await vi.waitFor(() => expect(native.client.destroy).toHaveBeenCalledOnce());
});
test('requires explicit selections, discovers GATT and removes an obsolete notification stream', async () => {
  const { demo } = await scanned();
  await demo.perform('connect');
  expect(native.client.connectToDevice).toHaveBeenCalledWith('peer-1', { timeout: 10000 });
  expect(demo.ble.fields()).toHaveLength(1);
  await demo.perform('read');
  expect(demo.error()).toContain('select a characteristic');
  demo.ble.selectField('service-1/field-1');
  await demo.perform('read');
  expect(demo.ble.value()).toBe('AQ==');
  await demo.perform('observe');
  const emit = native.client.monitorCharacteristicForDevice.mock.calls[0][3];
  emit(null, { value: 'Ag==' });
  expect(demo.ble.value()).toBe('Ag==');
  await demo.perform('stop-observe');
  emit(null, { value: 'stale' });
  expect(demo.ble.value()).toBe('Ag==');
  expect(native.removeMonitor).toHaveBeenCalled();
});
test('releases a connection that resolves after leaving the screen', async () => {
  const { demo, detectChanges } = await scanned();
  let complete: (value: { id: string }) => void = () => {};
  native.client.connectToDevice.mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    }),
  );
  const pending = demo.perform('connect');
  await vi.waitFor(() => expect(native.client.connectToDevice).toHaveBeenCalled());
  cleanup();
  complete({ id: 'peer-1' });
  await pending;
  await detectChanges().catch(() => {});
  expect(native.client.cancelDeviceConnection).toHaveBeenCalledWith('peer-1');
  expect(demo.ble.connected()).toBeNull();
  expect(native.client.discoverAllServicesAndCharacteristicsForDevice).not.toHaveBeenCalled();
});

test('clears scanning state when the native start operation fails', async () => {
  const { demo } = await setup();
  native.client.startDeviceScan.mockRejectedValue(new Error('Adapter unavailable'));
  await demo.perform('scan');
  expect(demo.ble.scanning()).toBe(false);
  expect(demo.error()).toContain('Adapter unavailable');
});

test('does not initialize the radio manager when Android scan/connect permissions are denied', async () => {
  native.platform.OS = 'android';
  native.platform.Version = 36;
  native.requestPermissions.mockResolvedValue({
    scan: 'denied',
    connect: 'granted',
    fine: 'granted',
    coarse: 'granted',
  });
  const { demo } = await setup();
  await demo.perform('scan');
  expect(native.requestPermissions).toHaveBeenCalledWith(
    expect.arrayContaining(['scan', 'connect', 'fine', 'coarse']),
  );
  expect(native.create).not.toHaveBeenCalled();
  expect(demo.error()).toContain('denied');
});
