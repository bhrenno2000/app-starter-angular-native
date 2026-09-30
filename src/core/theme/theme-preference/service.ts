import { Injectable, inject, signal } from '@angular/core';
import { ColorScheme } from '@ng-native/device';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MMKV_KEYS } from '@/core/storage/keys';
export type ThemeMode = 'system' | 'light' | 'dark';
@Injectable({ providedIn: 'root' })
export class ThemePreference {
  private readonly storage = inject(APP_STORAGE);
  private readonly appearance = inject(ColorScheme);
  private readonly preference = signal<ThemeMode>('system');
  readonly mode = this.preference.asReadonly();
  constructor() {
    const saved = this.storage.get(MMKV_KEYS.themeStore);
    this.apply(saved === 'light' || saved === 'dark' ? saved : 'system');
  }
  set(mode: ThemeMode): void {
    this.storage.set(MMKV_KEYS.themeStore, mode);
    this.apply(mode);
  }
  private apply(mode: ThemeMode): void {
    this.preference.set(mode);
    this.appearance.set(mode === 'system' ? null : mode);
  }
}
