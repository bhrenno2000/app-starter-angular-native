import { APP_STORAGE } from '@/core/storage/app-storage';
import { nativeStorage } from '@/core/storage/native-storage';
export function provideAppStorage() {
  return { provide: APP_STORAGE, useValue: nativeStorage };
}
