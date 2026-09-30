import { Component } from '@angular/core';
import { ColorScheme } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { MMKV_KEYS } from '@/core/storage/keys';
import { ThemePreference } from './index';
@Component({ selector: 'test-theme', template: '' })
class ThemeHost {}
afterEach(cleanup);
test('restores preference and returns to system appearance', async () => {
  const storage = new MemoryStorage();
  storage.set(MMKV_KEYS.themeStore, 'dark');
  const set = vi.fn();
  const result = await render(ThemeHost, {
    providers: [
      { provide: APP_STORAGE, useValue: storage },
      { provide: ColorScheme, useValue: { set } },
    ],
  });
  const theme = result.componentRef.injector.get(ThemePreference);
  expect(theme.mode()).toBe('dark');
  expect(set).toHaveBeenCalledWith('dark');
  theme.set('system');
  expect(set).toHaveBeenLastCalledWith(null);
  expect(storage.get(MMKV_KEYS.themeStore)).toBe('system');
});
