import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useCommunication } from './index';
const native = vi.hoisted(() => ({
  platform: { OS: 'ios' },
  mailAvailable: vi.fn(),
  smsAvailable: vi.fn(),
  compose: vi.fn(),
  sms: vi.fn(),
  clients: vi.fn(),
  browser: vi.fn(),
  canOpen: vi.fn(),
  open: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: native.platform }));
vi.mock('expo-mail-composer', () => ({
  isAvailableAsync: native.mailAvailable,
  composeAsync: native.compose,
  getClients: native.clients,
}));
vi.mock('expo-sms', () => ({ isAvailableAsync: native.smsAvailable, sendSMSAsync: native.sms }));
vi.mock('expo-web-browser', () => ({ openBrowserAsync: native.browser }));
vi.mock('expo-linking', () => ({ canOpenURL: native.canOpen, openURL: native.open }));
@Component({ selector: 'test-communication-hook', template: '' })
class Host {
  readonly demo = useCommunication();
}
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  native.platform.OS = 'ios';
  native.mailAvailable.mockResolvedValue(true);
  native.smsAvailable.mockResolvedValue(true);
  native.clients.mockReturnValue([{ label: 'Mail', url: 'message://' }]);
  native.compose.mockResolvedValue({ status: 'cancelled' });
  native.sms.mockResolvedValue({ result: 'cancelled' });
});
async function setup(front = signal(true)) {
  return render(Host, {
    providers: [
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active: signal(true) } },
    ],
  });
}
test('unavailable email/SMS do not invoke native composition', async () => {
  native.mailAvailable.mockResolvedValue(false);
  native.smsAvailable.mockResolvedValue(false);
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('email');
  expect(componentRef.instance.demo.error()).toContain('Email composition is unavailable');
  await componentRef.instance.demo.perform('sms');
  expect(componentRef.instance.demo.error()).toContain('SMS composition is unavailable');
  expect(native.compose).not.toHaveBeenCalled();
  expect(native.sms).not.toHaveBeenCalled();
});
test('drafts leave recipient selection to the native UI and never claim verified delivery', async () => {
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('email');
  expect(native.compose).toHaveBeenCalledWith(
    expect.objectContaining({ recipients: [], isHtml: false }),
  );
  expect(JSON.parse(componentRef.instance.demo.output())).toEqual({
    composerStatus: 'cancelled',
    deliveryVerified: false,
  });
  await componentRef.instance.demo.perform('sms');
  expect(native.sms).toHaveBeenCalledWith([], expect.any(String));
  expect(JSON.parse(componentRef.instance.demo.output()).deliveryVerified).toBe(false);
});
test('Android email handoff is not presented as a confirmed send', async () => {
  native.platform.OS = 'android';
  native.compose.mockResolvedValue({ status: 'sent' });
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('email');
  expect(JSON.parse(componentRef.instance.demo.output())).toEqual({
    composerStatus: 'not reported by Android',
    deliveryVerified: false,
  });
});
test('a late availability result cannot open a composer after navigation away', async () => {
  let resolve: (value: boolean) => void = () => {};
  native.mailAvailable.mockReturnValue(
    new Promise<boolean>((finish) => {
      resolve = finish;
    }),
  );
  const front = signal(true);
  const { componentRef } = await setup(front);
  const pending = componentRef.instance.demo.perform('email');
  front.set(false);
  resolve(true);
  await pending;
  expect(native.compose).not.toHaveBeenCalled();
  expect(componentRef.instance.demo.error()).toContain('no longer active');
});
