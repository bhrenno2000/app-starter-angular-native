import { provideNotificationCenter } from '../notifications';
import { provideNotificationInitializer } from '@/core/initializers/notifications';
import { provideNativeQueries } from '../query-client';
import { provideAppRouter } from '../router';
import { provideAppHttp } from '../http';
import { provideAppAuth } from '../auth';
import { provideAppStorage } from '../storage';
import { provideQueryClientInitializer } from '@/core/initializers/query-client';
import { provideThemeInitializer } from '@/core/initializers/theme';
export function provideApplication() {
  return [
    provideNativeQueries(),
    provideNotificationCenter(),
    provideNotificationInitializer(),
    provideAppRouter(),
    provideAppHttp(),
    provideAppAuth(),
    provideAppStorage(),
    provideThemeInitializer(),
    provideQueryClientInitializer(),
  ];
}
