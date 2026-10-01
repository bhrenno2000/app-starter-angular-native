import { Component, signal } from '@angular/core';
import { NativeNavigation } from '@ng-native/router';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { AuthSession } from '@/modules/auth/services/auth-session/service';
import { ThemePreference } from '@/core/theme/theme-preference';
import { useHome } from './index';
@Component({ selector: 'test-home-hook', template: '' })
class Host {
  readonly home = useHome();
}
afterEach(cleanup);
test('shows pending navigation and ignores an older failure after a successful retry', async () => {
  let rejectFirst: (cause: Error) => void = () => {};
  let finishSecond: (value: boolean) => void = () => {};
  const push = vi
    .fn()
    .mockReturnValueOnce(
      new Promise<boolean>((_, reject) => {
        rejectFirst = reject;
      }),
    )
    .mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        finishSecond = resolve;
      }),
    );
  const { componentRef } = await render(Host, {
    providers: [
      { provide: NativeNavigation, useValue: { push } },
      { provide: AuthSession, useValue: { user: signal(null) } },
      { provide: ThemePreference, useValue: { mode: signal('dark'), set: vi.fn() } },
    ],
  });
  const home = componentRef.instance.home;
  const first = home.openShowcase();
  expect(home.opening()).toBe(true);
  const second = home.openShowcase();
  finishSecond(true);
  await second;
  expect(home.opening()).toBe(false);
  expect(home.error()).toBeNull();
  rejectFirst(new Error('Old navigation failed'));
  await first;
  expect(home.error()).toBeNull();
  expect(home.opening()).toBe(false);
});
