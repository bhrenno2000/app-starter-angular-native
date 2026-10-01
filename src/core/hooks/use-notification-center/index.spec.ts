import { Component } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import * as Notifications from 'expo-notifications';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useNotificationCenter } from './index';

vi.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  setNotificationHandler: vi.fn(),
  getLastNotificationResponse: vi.fn(),
  clearLastNotificationResponse: vi.fn(),
  addNotificationReceivedListener: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn(),
}));

const notification: Notifications.Notification = {
  date: 1_700_000_000_000,
  request: {
    identifier: 'demo-notification',
    trigger: null,
    content: {
      title: 'Angular Native',
      subtitle: null,
      categoryIdentifier: null,
      sound: null,
      body: 'Demo notification',
      data: { privateValue: 'hidden' },
    },
  },
};
const response: Notifications.NotificationResponse = {
  notification,
  actionIdentifier: Notifications.DEFAULT_ACTION_IDENTIFIER,
};
const removeIncoming = vi.fn();
const removeResponse = vi.fn();

@Component({ selector: 'test-notification-center', template: '' })
class Host {
  readonly center = useNotificationCenter();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Notifications.getLastNotificationResponse).mockReturnValue(null);
  vi.mocked(Notifications.addNotificationReceivedListener).mockReturnValue({
    remove: removeIncoming,
  });
  vi.mocked(Notifications.addNotificationResponseReceivedListener).mockReturnValue({
    remove: removeResponse,
  });
});
afterEach(cleanup);

test('restores the native launch response without exposing its payload data', async () => {
  vi.mocked(Notifications.getLastNotificationResponse).mockReturnValue(response);
  const { componentRef } = await render(Host);
  const state = JSON.parse(componentRef.instance.center.reading());
  expect(state.received).toBeNull();
  expect(state.opened).toEqual({
    id: 'demo-notification',
    title: 'Angular Native',
    body: 'Demo notification',
    date: notification.date,
  });
  expect(componentRef.instance.center.reading()).not.toContain('privateValue');
});

test('distinguishes receipt from a user opening the notification', async () => {
  const { componentRef } = await render(Host);
  vi.mocked(Notifications.addNotificationReceivedListener).mock.calls[0][0](notification);
  expect(JSON.parse(componentRef.instance.center.reading()).opened).toBeNull();
  vi.mocked(Notifications.addNotificationResponseReceivedListener).mock.calls[0][0](response);
  const state = JSON.parse(componentRef.instance.center.reading());
  expect(state.received.id).toBe('demo-notification');
  expect(state.opened.id).toBe('demo-notification');
});

test('clears the native launch response as well as the visible event history', async () => {
  vi.mocked(Notifications.getLastNotificationResponse).mockReturnValue(response);
  const { componentRef } = await render(Host);
  vi.mocked(Notifications.addNotificationReceivedListener).mock.calls[0][0](notification);
  componentRef.instance.center.clear();
  expect(JSON.parse(componentRef.instance.center.reading())).toEqual({
    received: null,
    opened: null,
  });
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledOnce();
});

test('releases global listeners and the foreground presentation handler with its owner', async () => {
  const { componentRef } = await render(Host);
  const handler = vi.mocked(Notifications.setNotificationHandler).mock.calls[0][0];
  expect(await handler?.handleNotification(notification)).toEqual({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  });
  componentRef.destroy();
  expect(removeIncoming).toHaveBeenCalledOnce();
  expect(removeResponse).toHaveBeenCalledOnce();
  expect(Notifications.setNotificationHandler).toHaveBeenLastCalledWith(null);
});
