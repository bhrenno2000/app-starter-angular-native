import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useNfc } from './index';
const native = vi.hoisted(() => ({
  device: { isDevice: true },
  platform: { OS: 'ios' },
  linked: vi.fn(),
  manager: {
    start: vi.fn(),
    isSupported: vi.fn(),
    isEnabled: vi.fn(),
    requestTechnology: vi.fn(),
    cancelTechnologyRequest: vi.fn(),
    getTag: vi.fn(),
    goToNfcSetting: vi.fn(),
  },
  text: vi.fn(),
  uri: vi.fn(),
}));
vi.mock('expo-device', () => native.device);
vi.mock('react-native', () => ({
  Platform: native.platform,
  TurboModuleRegistry: { get: native.linked },
}));
vi.mock('react-native-nfc-manager', () => ({
  default: native.manager,
  NfcTech: { Ndef: 'Ndef' },
  Ndef: { text: { decodePayload: native.text }, uri: { decodePayload: native.uri } },
}));
@Component({ template: '' })
class Host {
  readonly demo = useNfc();
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => {
  vi.resetAllMocks();
  native.device.isDevice = true;
  native.platform.OS = 'ios';
  native.linked.mockReturnValue({});
  native.manager.isSupported.mockResolvedValue(true);
  native.manager.isEnabled.mockResolvedValue(true);
  native.manager.start.mockResolvedValue(undefined);
  native.manager.requestTechnology.mockResolvedValue('Ndef');
  native.manager.cancelTechnologyRequest.mockResolvedValue(undefined);
  native.manager.getTag.mockResolvedValue({
    id: 'tag-1',
    type: 'NDEF',
    techTypes: ['Ndef'],
    ndefMessage: [
      { tnf: 1, type: [84], payload: [2, 101, 110, 65] },
      { tnf: 1, type: [85], payload: [4, 97] },
    ],
  });
  native.text.mockReturnValue('Test tag');
  native.uri.mockReturnValue('https://example.com');
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
test('simulator reports linked capability without starting a tag session', async () => {
  native.device.isDevice = false;
  const { demo } = await setup();
  await demo.perform('support');
  expect(JSON.parse(demo.output())).toMatchObject({
    nativeModuleLinked: true,
    physicalDevice: false,
    radioCommunicationVerified: false,
  });
  await demo.perform('read');
  expect(demo.error()).toContain('physical');
  expect(native.manager.start).not.toHaveBeenCalled();
});
test('missing module and unsupported NDEF prevent reader activation', async () => {
  native.linked.mockReturnValue(null);
  const { demo } = await setup();
  await demo.perform('read');
  expect(demo.error()).toContain('native module is missing');
  native.linked.mockReturnValue({});
  native.manager.isSupported.mockResolvedValue(false);
  await demo.perform('read');
  expect(demo.error()).toContain('not supported');
  expect(native.manager.requestTechnology).not.toHaveBeenCalled();
});
test('reads text and URI records into the facade and closes the native session', async () => {
  const { demo } = await setup();
  await demo.perform('read');
  expect(demo.nfc.tag()).toMatchObject({
    id: 'tag-1',
    recordsTotal: 2,
    records: [
      { kind: 'text', value: 'Test tag', payloadHex: '02656e41' },
      { kind: 'uri', value: 'https://example.com', payloadHex: '0461' },
    ],
  });
  expect(native.manager.requestTechnology).toHaveBeenCalledWith('Ndef', expect.any(Object));
  expect(native.manager.cancelTechnologyRequest).toHaveBeenCalled();
  expect(demo.nfc.scanning()).toBe(false);
  expect(demo.error()).toBeNull();
});
test('Android disabled NFC never requests a technology session', async () => {
  native.platform.OS = 'android';
  native.manager.isEnabled.mockResolvedValue(false);
  const { demo } = await setup();
  await demo.perform('read');
  expect(demo.error()).toContain('NFC is disabled');
  expect(native.manager.requestTechnology).not.toHaveBeenCalled();
});
test('explicit cancellation discards a late tag and prevents overlapping requests', async () => {
  let finish: ((value: string) => void) | undefined;
  native.manager.requestTechnology.mockImplementation(
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  const { demo } = await setup();
  const reading = demo.perform('read');
  await vi.waitFor(() => expect(native.manager.requestTechnology).toHaveBeenCalledTimes(1));
  demo.nfc.cancel();
  await reading;
  expect(demo.error()).toContain('cancelled');
  expect(demo.nfc.scanning()).toBe(false);
  await demo.perform('read');
  expect(demo.error()).toContain('still closing');
  finish?.('Ndef');
  await vi.waitFor(() => expect(native.manager.cancelTechnologyRequest).toHaveBeenCalledTimes(2));
  expect(demo.nfc.tag()).toBeNull();
  expect(native.manager.getTag).not.toHaveBeenCalled();
});
test('screen suspension cancels a retained native reader', async () => {
  native.manager.requestTechnology.mockImplementation(() => new Promise(() => {}));
  const front = signal(true);
  const { demo, detectChanges } = await setup(front);
  const reading = demo.perform('read');
  await vi.waitFor(() => expect(native.manager.requestTechnology).toHaveBeenCalled());
  front.set(false);
  await detectChanges();
  await reading;
  expect(native.manager.cancelTechnologyRequest).toHaveBeenCalled();
  expect(demo.nfc.tag()).toBeNull();
});
test('read deadline cancels native waiting and exposes timeout', async () => {
  native.manager.requestTechnology.mockImplementation(() => new Promise(() => {}));
  const { demo } = await setup();
  vi.useFakeTimers();
  const reading = demo.perform('read');
  await vi.waitFor(() => expect(native.manager.requestTechnology).toHaveBeenCalled());
  await vi.advanceTimersByTimeAsync(20_000);
  await reading;
  expect(demo.error()).toContain('timed out');
  expect(demo.reading()).toContain('timed out');
  expect(native.manager.cancelTechnologyRequest).toHaveBeenCalled();
  expect(demo.nfc.scanning()).toBe(false);
});
test('malformed records remain visible as raw evidence without failing the session', async () => {
  native.text.mockImplementation(() => {
    throw new Error('Malformed');
  });
  const { demo } = await setup();
  await demo.perform('read');
  expect(demo.nfc.tag()?.records[0]).toMatchObject({ kind: 'malformed', payloadHex: '02656e41' });
  expect(demo.error()).toBeNull();
});

test('normalizes iOS native tech metadata into the consumer contract', async () => {
  native.manager.getTag.mockResolvedValue({ id: 'ios-tag', tech: 'mifare', ndefMessage: [] });
  const { demo } = await setup();
  await demo.perform('read');
  expect(demo.nfc.tag()).toMatchObject({ technologies: ['mifare'], recordsTotal: 0 });
});
