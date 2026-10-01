import { provideNativeRouter } from '@ng-native/router';
import { routes } from '@/app/app.routes';
export function provideAppRouter() {
  return provideNativeRouter(routes);
}
