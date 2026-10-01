import { Component, signal } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import * as Notifications from 'expo-notifications';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { NOTIFICATION_CENTER } from '@/core/providers/notifications';
import { useNotifications } from './index';

vi.mock('expo-constants', () => ({ default: { expoConfig: { extra: {} } } }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
vi.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  getPresentedNotificationsAsync: vi.fn(),
  dismissNotificationAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  getExpoPushTokenAsync: vi.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

@Component({ selector: 'test-notifications-hook', template: '' })
class Host {
  readonly demo = useNotifications();
}

function request(
  identifier: string,
  data: Record<string, unknown> = {},
): Notifications.NotificationRequest {
  return {
    identifier,
    trigger: null,
    content: {
      title: null,
      subtitle: null,
      body: null,
      sound: null,
      categoryIdentifier: null,
      data,
    },
  };
}

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
async function setup() {
  return render(Host, {
    providers: [
      {
        provide: NOTIFICATION_CENTER,
        useValue: { reading: signal('{"received":null,"opened":null}'), clear: vi.fn() },
      },
    ],
  });
}

test('cancels only showcase-owned scheduled requests, preserving other notifications', async () => {
  vi.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([
    request('demo', { showcase: true }),
    request('other', { showcase: false }),
    request('missing-marker'),
  ]);
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('cancel');
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledExactlyOnceWith('demo');
  expect(componentRef.instance.demo.error()).toBeNull();
});

test('dismisses only showcase-owned delivered notifications', async () => {
  vi.mocked(Notifications.getPresentedNotificationsAsync).mockResolvedValue([
    { date: 1_700_000_000_000, request: request('demo', { showcase: true }) },
    { date: 1_700_000_000_000, request: request('other') },
  ]);
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('dismiss');
  expect(Notifications.dismissNotificationAsync).toHaveBeenCalledExactlyOnceWith('demo');
});

test('denied permission prevents scheduling a native notification', async () => {
  vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({
    granted: false,
  } as Notifications.NotificationPermissionsStatus);
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('schedule');
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  expect(componentRef.instance.demo.error()).toBe('Notification permission was denied.');
});

test('missing push configuration does not request permission or contact Expo push', async () => {
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('push');
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  expect(componentRef.instance.demo.error()).toContain('EXPO_PUBLIC_EAS_PROJECT_ID');
});
