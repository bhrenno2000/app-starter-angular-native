import { cleanup, render, screen, userEvent, waitFor } from '@ng-native/testing';
import { Router } from '@angular/router';
import { provideNativeRouter } from '@ng-native/router';
import { afterEach, expect, test } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { SECURE_KEYS } from '@/core/storage/keys';
import { AUTH_BACKEND } from '@/modules/auth/services/auth-backend/service';
import { MockAuthBackend } from '@/modules/auth/services/mock-auth-backend/service';
import { provideAppIcons } from '@/core/providers/icons';
import { provideThemeInitializer } from '@/core/initializers/theme';
import { App } from './app';
import { routes } from './app.routes';
afterEach(cleanup);
async function setup(storage = new MemoryStorage()) {
  return render(App, {
    providers: [
      provideAppIcons(),
      provideNativeRouter(routes),
      provideThemeInitializer(),
      { provide: APP_STORAGE, useValue: storage },
      { provide: AUTH_BACKEND, useValue: new MockAuthBackend() },
    ],
  });
}
test('protects home, logs in, changes theme and logs out', async () => {
  const result = await setup();
  const router = result.componentRef.injector.get(Router);
  await router.navigateByUrl('/home');
  expect(await screen.findByText('Welcome back')).toBeTruthy();
  expect(router.url).toBe('/auth/login');
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Password'), 'password');
  await user.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('Mock User')).toBeTruthy();
  await waitFor(() => expect(router.url).toBe('/home'));
  await user.press(screen.getByRole('button', { name: 'Dark' }));
  await user.press(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByText('Welcome back')).toBeTruthy();
  expect(router.url).toBe('/auth/login');
});
test('restores session before deciding whether to show login', async () => {
  const storage = new MemoryStorage();
  await storage.setSecret(SECURE_KEYS.refreshToken, 'mock:ada@example.com');
  const result = await setup(storage);
  const router = result.componentRef.injector.get(Router);
  await router.navigateByUrl('/auth/login');
  expect(await screen.findByText('ada@example.com')).toBeTruthy();
  expect(router.url).toBe('/home');
});

test('redirects an unknown showcase category before loading native SDKs', async () => {
  const storage = new MemoryStorage();
  await storage.setSecret(SECURE_KEYS.refreshToken, 'mock:demo@example.com');
  const { componentRef } = await setup(storage);
  const router = componentRef.injector.get(Router);
  await router.navigateByUrl('/showcase/not-a-demo');
  expect(await screen.findByText('Native showcase')).toBeTruthy();
  expect(router.url).toBe('/showcase');
});
