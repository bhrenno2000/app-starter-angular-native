import { Component, InjectionToken, inject, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render, waitFor } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useScreenLifecycle } from './index';
const STOP = new InjectionToken<() => void>('screen-stop');
@Component({ selector: 'test-screen-lifecycle', template: '' })
class Host {
  readonly lifecycle = useScreenLifecycle(inject(STOP));
}
afterEach(cleanup);
test('suspends a retained screen and invalidates pending work even after returning to it', async () => {
  const front = signal(true);
  const foreground = signal(true);
  const stop = vi.fn();
  const { componentRef } = await render(Host, {
    providers: [
      { provide: STOP, useValue: stop },
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active: foreground } },
    ],
  });
  const pending = componentRef.instance.lifecycle.checkpoint();
  expect(pending()).toBe(true);
  front.set(false);
  await waitFor(() => expect(stop).toHaveBeenCalled());
  expect(pending()).toBe(false);
  front.set(true);
  await waitFor(() => expect(() => componentRef.instance.lifecycle.assertActive()).not.toThrow());
  expect(pending()).toBe(false);
  expect(componentRef.instance.lifecycle.checkpoint()()).toBe(true);
  componentRef.destroy();
  expect(() => componentRef.instance.lifecycle.assertActive()).toThrow('no longer active');
});
test('suspends active hardware when the app enters the background', async () => {
  const foreground = signal(true);
  const stop = vi.fn();
  const { componentRef } = await render(Host, {
    providers: [
      { provide: STOP, useValue: stop },
      { provide: AppState, useValue: { active: foreground } },
    ],
  });
  foreground.set(false);
  await waitFor(() => expect(stop).toHaveBeenCalled());
  expect(() => componentRef.instance.lifecycle.assertActive()).toThrow('no longer active');
  componentRef.destroy();
});

test('cleanup state is not a dependency of the lifecycle effect', async () => {
  const foreground = signal(true);
  const cleanups = signal(0);
  const stop = vi.fn(() => cleanups.update((value) => value + 1));
  const { componentRef, detectChanges } = await render(Host, {
    providers: [
      { provide: STOP, useValue: stop },
      { provide: AppState, useValue: { active: foreground } },
    ],
  });
  foreground.set(false);
  await detectChanges();
  expect(stop).toHaveBeenCalledOnce();
  cleanups.set(20);
  await detectChanges();
  expect(stop).toHaveBeenCalledOnce();
  componentRef.destroy();
  expect(stop).toHaveBeenCalledTimes(2);
});
