import { DeepLinks } from '@ng-native/device';
import { useAppLinks } from '@/core/hooks/use-app-links';
export function provideAppLinks() {
  return { provide: DeepLinks.SOURCE, useFactory: useAppLinks };
}
