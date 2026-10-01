import { InjectionToken } from '@angular/core';
import { useNotificationCenter } from '@/core/hooks/use-notification-center';
import type { NotificationCenter } from './types';
export const NOTIFICATION_CENTER = new InjectionToken<NotificationCenter>('app.notificationCenter');
export function provideNotificationCenter() {
  return { provide: NOTIFICATION_CENTER, useFactory: useNotificationCenter };
}
