import { InjectionToken } from '@angular/core';
export interface AppStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  getSecret(key: string): Promise<string | null>;
  setSecret(key: string, value: string): Promise<void>;
  removeSecret(key: string): Promise<void>;
}
export const APP_STORAGE = new InjectionToken<AppStorage>('app-storage');
