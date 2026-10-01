import { provideNativeRouter, withLinkParent } from '@ng-native/router';
import { appLinkParent } from '@/modules/showcase/utils/app-link';
import { routes } from '@/app/app.routes';
export function provideAppRouter() {
  return provideNativeRouter(routes, withLinkParent(appLinkParent));
}
