import { DestroyRef, computed, inject, signal } from '@angular/core';
import * as Notifications from 'expo-notifications';
import type { Notification, NotificationSummary } from './types';
export function useNotificationCenter() {
  const received = signal<NotificationSummary | null>(null);
  const opened = signal<NotificationSummary | null>(null);
  const summarize = (notification: Notification): NotificationSummary => ({
    id: notification.request.identifier,
    title: notification.request.content.title,
    body: notification.request.content.body,
    date: notification.date,
  });
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const last = Notifications.getLastNotificationResponse();
  if (last) opened.set(summarize(last.notification));
  const incoming = Notifications.addNotificationReceivedListener((notification) => {
    received.set(summarize(notification));
  });
  const response = Notifications.addNotificationResponseReceivedListener((event) => {
    opened.set(summarize(event.notification));
  });
  inject(DestroyRef).onDestroy(() => {
    incoming.remove();
    response.remove();
    Notifications.setNotificationHandler(null);
  });
  return {
    reading: computed(() => JSON.stringify({ received: received(), opened: opened() }, null, 2)),
    clear: () => {
      received.set(null);
      opened.set(null);
      Notifications.clearLastNotificationResponse();
    },
  };
}
