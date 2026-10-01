import { computed, signal } from '@angular/core';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { isDevice } from 'expo-device';
import { BleManager, State } from 'react-native-ble-plx';
import type { Subscription } from 'react-native-ble-plx';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { BleField, BlePeer } from './types';
export function useBle() {
  const devices = signal<readonly BlePeer[]>([]);
  const fields = signal<readonly BleField[]>([]);
  const selected = signal<string | null>(null);
  const selectedField = signal<string | null>(null);
  const connected = signal<string | null>(null);
  const scanning = signal(false);
  const status = signal('Inspect the adapter or start a scan on a physical device.');
  const value = signal<string | null>(null);
  let manager: BleManager | null = null;
  let disposing: Promise<void> = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let monitor: Subscription | null = null;
  let disconnection: Subscription | null = null;
  let scanEpoch = 0;
  let monitorEpoch = 0;
  let connectionEpoch = 0;
  let abortAdapter: (() => void) | null = null;
  const clearScan = () => {
    scanEpoch++;
    if (timer) clearTimeout(timer);
    timer = null;
    scanning.set(false);
  };
  const stopMonitor = () => {
    monitorEpoch++;
    monitor?.remove();
    monitor = null;
  };
  const release = () => {
    connectionEpoch++;
    abortAdapter?.();
    clearScan();
    stopMonitor();
    disconnection?.remove();
    disconnection = null;
    const old = manager;
    manager = null;
    connected.set(null);
    value.set(null);
    fields.set([]);
    selectedField.set(null);
    if (old)
      disposing = old
        .stopDeviceScan()
        .catch(() => {})
        .then(() => old.destroy())
        .catch(() => {});
    status.set('BLE resources released when the screen became inactive.');
  };
  const lifecycle = useScreenLifecycle(release);
  async function client() {
    lifecycle.assertActive();
    if (!NativeModules.BlePlx)
      throw new Error('The BLE native module is missing. Rebuild and install the native client.');
    if (!isDevice)
      throw new Error(
        'Bluetooth BLE requires a physical iOS or Android device. The simulator cannot validate radio communication.',
      );
    const active = lifecycle.checkpoint();
    await disposing;
    if (Platform.OS === 'android') {
      const permissions =
        Number(Platform.Version) >= 31
          ? [
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]
          : [
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ];
      const grants = await PermissionsAndroid.requestMultiple(permissions);
      if (
        permissions.some((permission) => grants[permission] !== PermissionsAndroid.RESULTS.GRANTED)
      )
        throw new Error(
          'Bluetooth scan/connect permissions were denied. Enable them in system settings to continue.',
        );
    }
    if (!active())
      throw new Error('BLE activation cancelled because this screen is no longer active.');
    manager ??= new BleManager();
    return manager;
  }
  async function powered(client: BleManager) {
    let state = await client.state();
    if (state === State.Unknown || state === State.Resetting) {
      state = await new Promise<State>((resolve, reject) => {
        let subscription: Subscription | null = null;
        let finished = false;
        const timeout = setTimeout(() => finish(null), 8_000);
        const finish = (next: State | null) => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          subscription?.remove();
          abortAdapter = null;
          if (next) resolve(next);
          else
            reject(
              new Error(
                'Bluetooth initialization timed out or was cancelled. Retry while this screen is active.',
              ),
            );
        };
        abortAdapter = () => finish(null);
        subscription = client.onStateChange((next) => {
          if (next !== State.Unknown && next !== State.Resetting) finish(next);
        }, true);
        if (finished) subscription.remove();
      });
    }
    if (state !== State.PoweredOn)
      throw new Error(
        `Bluetooth adapter state: ${state}. Enable Bluetooth and allow access before retrying.`,
      );
  }
  async function stopScan() {
    clearScan();
    await manager?.stopDeviceScan();
    status.set('BLE scan stopped.');
    return { scanning: false, devicesFound: devices().length };
  }
  async function bounded<T>(
    operation: Promise<T>,
    client: BleManager,
    transaction: string,
  ): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => {
            void client.cancelTransaction(transaction).catch(() => {});
            reject(
              new Error('The BLE operation timed out. Retry with the selected peripheral nearby.'),
            );
          }, 12_000);
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  function choice() {
    const id = connected();
    const field = fields().find((entry) => entry.key === selectedField());
    if (!manager || !id || !field)
      throw new Error('Connect a scanned device and select a characteristic first.');
    return { client: manager, id, field };
  }
  return {
    ble: {
      devices: devices.asReadonly(),
      fields: fields.asReadonly(),
      scanning: scanning.asReadonly(),
      connected: connected.asReadonly(),
      selected: selected.asReadonly(),
      selectedField: selectedField.asReadonly(),
      status: status.asReadonly(),
      value: value.asReadonly(),
      select: (id: string) => {
        if (devices().some((entry) => entry.id === id)) selected.set(id);
      },
      selectField: (key: string) => {
        if (fields().some((entry) => entry.key === key)) {
          stopMonitor();
          value.set(null);
          selectedField.set(key);
        }
      },
    },
    reading: computed(() => status()),
    ...useNativeTask([
      {
        id: 'adapter',
        label: 'Inspect Bluetooth adapter',
        run: async () => {
          if (!isDevice)
            return {
              nativeModuleLinked: Boolean(NativeModules.BlePlx),
              physicalDevice: false,
              radioCommunicationVerified: false,
              note: 'Use a physical device for BLE scanning and GATT operations.',
            };
          const current = await client();
          const state = await current.state();
          status.set(`Bluetooth adapter: ${state}`);
          return { physicalDevice: true, adapterState: state, radioCommunicationVerified: false };
        },
      },
      {
        id: 'scan',
        label: 'Scan BLE devices for 10 seconds',
        run: async () => {
          const current = await client();
          const active = lifecycle.checkpoint();
          await powered(current);
          await stopScan();
          if (!active()) throw new Error('BLE scan cancelled because the screen became inactive.');
          devices.set([]);
          selected.set(null);
          scanning.set(true);
          status.set('Scanning nearby BLE advertisements for up to 10 seconds.');
          const epoch = scanEpoch;
          timer = setTimeout(() => {
            void stopScan().catch(() => release());
          }, 10_000);
          try {
            await bounded(
              current.startDeviceScan(null, null, (error, device) => {
                if (!active() || epoch !== scanEpoch) return;
                if (error) {
                  clearScan();
                  status.set(`BLE scan failed: ${error.message}`);
                  void current.stopDeviceScan().catch(() => {});
                  return;
                }
                if (!device) return;
                const peer = {
                  id: device.id,
                  label: device.name ?? device.localName ?? 'Unnamed BLE device',
                  rssi: device.rssi,
                };
                devices.update((rows) =>
                  [...rows.filter((row) => row.id !== peer.id), peer]
                    .sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999))
                    .slice(0, 25),
                );
              }),
              current,
              'showcase-scan',
            );
          } catch (error) {
            clearScan();
            await current.stopDeviceScan().catch(() => {});
            status.set('BLE scan activation failed.');
            throw error;
          }
          if (!active() || epoch !== scanEpoch) {
            await current.stopDeviceScan().catch(() => {});
            scanning.set(false);
            return 'BLE scan activation cancelled.';
          }
          return 'BLE scan started. Select an advertisement before connecting. No connection is made automatically.';
        },
      },
      { id: 'stop-scan', label: 'Stop BLE scan', run: stopScan },
      {
        id: 'connect',
        label: 'Connect selected BLE device',
        run: async () => {
          const id = selected();
          if (!id || !devices().some((row) => row.id === id))
            throw new Error('Select a device found by the scan first.');
          if (connected())
            throw new Error('Disconnect the current peripheral before connecting another one.');
          const current = await client();
          const active = lifecycle.checkpoint();
          await powered(current);
          await stopScan();
          if (!active())
            throw new Error('BLE connection cancelled because the screen became inactive.');
          const epoch = ++connectionEpoch;
          const device = await current.connectToDevice(id, { timeout: 10_000 });
          if (!active()) {
            await current.cancelDeviceConnection(device.id).catch(() => {});
            throw new Error('Late BLE connection released because the screen is inactive.');
          }
          connected.set(id);
          disconnection = current.onDeviceDisconnected(id, () => {
            if (!active() || epoch !== connectionEpoch || connected() !== id) return;
            connectionEpoch++;
            stopMonitor();
            connected.set(null);
            value.set(null);
            fields.set([]);
            selectedField.set(null);
            status.set('The peripheral disconnected.');
          });
          let continuing = true;
          try {
            const discovered = await bounded(
              (async () => {
                await current.discoverAllServicesAndCharacteristicsForDevice(
                  id,
                  'showcase-discover',
                );
                const services = await current.servicesForDevice(id);
                const result: BleField[] = [];
                for (const service of services.slice(0, 20)) {
                  if (!continuing || !active() || epoch !== connectionEpoch)
                    throw new Error(
                      'BLE discovery cancelled because the connection or screen changed.',
                    );
                  const characteristics = await current.characteristicsForDevice(id, service.uuid);
                  for (const field of characteristics.slice(0, 50))
                    result.push({
                      key: `${service.uuid}/${field.uuid}`,
                      service: service.uuid,
                      uuid: field.uuid,
                      readable: field.isReadable,
                      notifiable: field.isNotifiable || field.isIndicatable,
                    });
                }
                return { services, result };
              })(),
              current,
              'showcase-discover',
            );
            if (!active() || epoch !== connectionEpoch || connected() !== id)
              throw new Error('BLE discovery cancelled because the connection or screen changed.');
            fields.set(discovered.result);
            status.set('Connected. Select a discovered characteristic to read or observe it.');
            return {
              connectedDevice: id,
              services: discovered.services.map((service) => service.uuid),
              characteristicsShown: discovered.result.length,
            };
          } catch (error) {
            await current.cancelDeviceConnection(id).catch(() => {});
            connected.set(null);
            disconnection?.remove();
            disconnection = null;
            throw error;
          } finally {
            continuing = false;
          }
        },
      },
      {
        id: 'read',
        label: 'Read selected BLE characteristic',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const { client, id, field } = choice();
          const epoch = connectionEpoch;
          if (!field.readable) throw new Error('This characteristic does not support reading.');
          const result = await bounded(
            client.readCharacteristicForDevice(id, field.service, field.uuid, 'showcase-read'),
            client,
            'showcase-read',
          );
          if (!active() || epoch !== connectionEpoch || connected() !== id)
            return 'BLE read cancelled because the connection or screen changed.';
          value.set(result.value ?? null);
          return { characteristic: field.uuid, valueBase64: result.value };
        },
      },
      {
        id: 'observe',
        label: 'Observe selected BLE characteristic',
        run: () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const { client, id, field } = choice();
          if (!field.notifiable)
            throw new Error('This characteristic does not support notifications or indications.');
          stopMonitor();
          const epoch = monitorEpoch;
          monitor = client.monitorCharacteristicForDevice(
            id,
            field.service,
            field.uuid,
            (error, update) => {
              if (!active() || epoch !== monitorEpoch || connected() !== id) return;
              if (error) {
                stopMonitor();
                status.set(`BLE observation failed: ${error.message}`);
                return;
              }
              value.set(update?.value ?? null);
            },
            'showcase-observe',
          );
          return 'Observing native characteristic updates. Values are shown as base64 and remain on this screen.';
        },
      },
      {
        id: 'stop-observe',
        label: 'Stop BLE observation',
        run: () => {
          stopMonitor();
          return 'BLE observation stopped.';
        },
      },
      {
        id: 'disconnect',
        label: 'Disconnect BLE device',
        run: async () => {
          connectionEpoch++;
          stopMonitor();
          disconnection?.remove();
          disconnection = null;
          const id = connected();
          if (id && manager) await manager.cancelDeviceConnection(id);
          connected.set(null);
          fields.set([]);
          selectedField.set(null);
          value.set(null);
          status.set('BLE peripheral disconnected.');
          return 'Disconnected from the selected peripheral.';
        },
      },
    ]),
  };
}
