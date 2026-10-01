import { inject, provideAppInitializer } from '@angular/core';
import { NOTIFICATION_CENTER } from '@/core/providers/notifications';
export function provideNotificationInitializer() {
  return provideAppInitializer(() => {
    inject(NOTIFICATION_CENTER);
  });
}
