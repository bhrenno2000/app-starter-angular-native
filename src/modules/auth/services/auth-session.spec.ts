import { Component } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { SECURE_KEYS, MMKV_KEYS } from '@/core/storage/keys';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { AUTH_BACKEND } from './auth-backend';
import { MockAuthBackend } from './mock-auth-backend';
import { AuthSession } from './auth-session';
@Component({ selector: 'test-session', template: '' })
class SessionHost {}
afterEach(cleanup);
async function setup(storage = new MemoryStorage(), backend = new MockAuthBackend()) {
  const result = await render(SessionHost, {
    providers: [
      { provide: APP_STORAGE, useValue: storage },
      { provide: AUTH_BACKEND, useValue: backend },
    ],
  });
  return { session: result.componentRef.injector.get(AuthSession), storage, backend };
}
test('persists only refresh token and restores session after a new mount', async () => {
  const first = await setup();
  await first.session.login({ email: 'ada@example.com', password: 'password' });
  expect(first.storage.secrets.get(SECURE_KEYS.refreshToken)).toBe('mock:ada@example.com');
  expect(first.storage.values.get(MMKV_KEYS.userStore)).not.toContain('mock-access-token');
  cleanup();
  const second = await setup(first.storage);
  await second.session.restore();
  expect(second.session.user()?.email).toBe('ada@example.com');
  expect(second.session.authenticated()).toBe(true);
});
test('does not authenticate if secure persistence fails', async () => {
  const state = await setup();
  vi.spyOn(state.storage, 'setSecret').mockRejectedValue(new Error('locked'));
  await expect(
    state.session.login({ email: 'ada@example.com', password: 'password' }),
  ).rejects.toThrow('locked');
  expect(state.session.authenticated()).toBe(false);
});
test('deduplicates concurrent token refreshes', async () => {
  const state = await setup();
  await state.session.login({ email: 'ada@example.com', password: 'password' });
  const refresh = vi.spyOn(state.backend, 'refresh');
  await Promise.all([state.session.refresh(), state.session.refresh()]);
  expect(refresh).toHaveBeenCalledTimes(1);
});
test('clears local session even when remote logout fails', async () => {
  const state = await setup();
  await state.session.login({ email: 'ada@example.com', password: 'password' });
  vi.spyOn(state.backend, 'logout').mockRejectedValue(new Error('offline'));
  await expect(state.session.logout()).rejects.toThrow('offline');
  expect(state.session.authenticated()).toBe(false);
  expect(state.storage.secrets.has(SECURE_KEYS.refreshToken)).toBe(false);
  expect(state.storage.values.has(MMKV_KEYS.userStore)).toBe(false);
});
test('a late refresh cannot resurrect a logged out session', async () => {
  const state = await setup();
  await state.session.login({ email: 'ada@example.com', password: 'password' });
  const updated = await state.backend.login({ email: 'ada@example.com', password: '' });
  let finish: (value: typeof updated) => void = () => {};
  vi.spyOn(state.backend, 'refresh').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const refreshing = state.session.refresh();
  await state.session.logout();
  finish(updated);
  await refreshing;
  expect(state.session.authenticated()).toBe(false);
  expect(state.storage.secrets.has(SECURE_KEYS.refreshToken)).toBe(false);
});
