import type { HttpHandlerFn } from './types';
import { Component, runInInjectionContext } from '@angular/core';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { cleanup, render } from '@ng-native/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { afterEach, expect, test, vi } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { AUTH_BACKEND } from '@/modules/auth/services/auth-backend/service';
import { MockAuthBackend } from '@/modules/auth/services/mock-auth-backend/service';
import { AuthSession } from '@/modules/auth/services/auth-session/service';
import { env } from '@/core/constants/env';
import { authInterceptor } from './index';
@Component({ selector: 'test-http', template: '' })
class HttpHost {}
afterEach(cleanup);
async function setup() {
  const backend = new MockAuthBackend();
  const result = await render(HttpHost, {
    providers: [
      { provide: APP_STORAGE, useValue: new MemoryStorage() },
      { provide: AUTH_BACKEND, useValue: backend },
    ],
  });
  const injector = result.componentRef.injector;
  await injector.get(AuthSession).login({ email: 'ada@example.com', password: 'password' });
  return { injector, backend };
}
test('does not attach session credentials to another origin', async () => {
  const { injector } = await setup();
  const request = new HttpRequest('GET', 'https://external.example.com/profile');
  const next = vi.fn<HttpHandlerFn>(() => of(new HttpResponse({ status: 200 })));
  await firstValueFrom(runInInjectionContext(injector, () => authInterceptor(request, next)));
  expect(next.mock.calls[0][0].headers.has('Authorization')).toBe(false);
});
test('refreshes concurrent 401 responses once and retries each request once', async () => {
  const { injector, backend } = await setup();
  const refresh = vi.spyOn(backend, 'refresh');
  const next = vi.fn<HttpHandlerFn>(() => throwError(() => new HttpErrorResponse({ status: 401 })));
  const run = () =>
    firstValueFrom(
      runInInjectionContext(injector, () =>
        authInterceptor(new HttpRequest('GET', `${env.apiUrl}/users/me`), next),
      ),
    );
  const results = await Promise.allSettled([run(), run()]);
  expect(results.every((result) => result.status === 'rejected')).toBe(true);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(4);
  expect(next.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer mock-access-token');
});
