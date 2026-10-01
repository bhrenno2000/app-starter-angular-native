import { Component, signal } from '@angular/core';
import { AppState, LayoutAnimation, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useLayoutMotion } from './index';
const native = vi.hoisted(() => {
  class Value {
    stopAnimation = vi.fn();
    interpolate = vi.fn(() => ({}));
  }
  return { Value, timing: vi.fn() };
});
vi.mock('react-native', () => ({
  Platform: { isDisableAnimations: false, isTesting: false },
  Animated: { Value: native.Value, timing: native.timing },
  Easing: { ease: () => {}, inOut: (value: unknown) => value },
}));
@Component({ selector: 'test-layout-motion', template: '' })
class Host {
  readonly demo = useLayoutMotion();
}
afterEach(cleanup);
async function setup(source: object | null, front = signal(true)) {
  const { componentRef } = await render(Host, {
    providers: [
      { provide: LayoutAnimation.SOURCE, useValue: source },
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active: signal(true) } },
    ],
  });
  return componentRef.instance.demo;
}
test('configures native layout changes and bounds preview insertion', async () => {
  const configureNext = vi.fn((_config, done) => done());
  const demo = await setup({ configureNext });
  await demo.perform('expand');
  expect(demo.layout.expanded()).toBe(true);
  expect(configureNext).toHaveBeenCalledWith(
    expect.objectContaining({ duration: 600, update: { type: 'easeInEaseOut' } }),
    expect.any(Function),
  );
  for (let i = 0; i < 3; i++) await demo.perform('add');
  expect(demo.layout.rows()).toHaveLength(5);
  await demo.perform('add');
  expect(demo.layout.rows()).toHaveLength(5);
  expect(demo.error()).toContain('up to five rows');
  await demo.perform('remove');
  expect(demo.layout.rows()).toHaveLength(4);
});
test('does not change the preview when native animation is unavailable or the screen is hidden', async () => {
  const unsupported = await setup(null);
  await unsupported.perform('expand');
  expect(unsupported.layout.expanded()).toBe(false);
  expect(unsupported.error()).toContain('unavailable');
  cleanup();
  const configureNext = vi.fn();
  const hidden = await setup({ configureNext }, signal(false));
  await hidden.perform('add');
  expect(hidden.layout.rows()).toHaveLength(2);
  expect(configureNext).not.toHaveBeenCalled();
  expect(hidden.error()).toContain('no longer active');
});

test('uses the native driver and cancels its animation on screen teardown', async () => {
  const stop = vi.fn();
  let done: (result: { finished: boolean }) => void = () => {};
  native.timing.mockReturnValue({
    start: (callback: typeof done) => {
      done = callback;
    },
    stop: () => {
      stop();
      done({ finished: false });
    },
  });
  const demo = await setup({ configureNext: vi.fn() });
  const pending = demo.perform('native-driver');
  expect(native.timing).toHaveBeenCalledWith(
    expect.any(native.Value),
    expect.objectContaining({ useNativeDriver: true, duration: 900, toValue: 140 }),
  );
  cleanup();
  await pending;
  expect(stop).toHaveBeenCalledOnce();
});
