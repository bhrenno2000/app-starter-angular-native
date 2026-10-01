import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render, waitFor } from '@ng-native/testing';
import { afterEach, expect, test } from 'vitest';
import { useInteractions } from './index';

@Component({ selector: 'test-interactions-hook', template: '' })
class Host {
  readonly demo = useInteractions();
}
afterEach(cleanup);
async function setup() {
  const front = signal(true);
  const active = signal(true);
  const result = await render(Host, {
    providers: [
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active } },
    ],
  });
  return { ...result, front, active };
}
function callbacks(gesture: object) {
  return Reflect.get(gesture, 'callbacks') as Record<string, (...args: unknown[]) => unknown>;
}
function child(gesture: object, index: number): object {
  return Reflect.get(gesture, 'gestures')[index];
}

test('bounds completed drag and pinch values and accumulates from the previous position', async () => {
  const { componentRef } = await setup();
  const interaction = componentRef.instance.demo.interaction;
  const pan = callbacks(child(interaction.transformGesture, 0));
  pan['onBegin']({});
  pan['onUpdate']({ translationX: 800, translationY: -800 });
  pan['onEnd']({});
  expect(JSON.parse(interaction.summary())).toMatchObject({
    translationX: 100,
    translationY: -45,
    lastGesture: 'pan',
  });
  pan['onBegin']({});
  pan['onUpdate']({ translationX: -30, translationY: 20 });
  pan['onEnd']({});
  expect(JSON.parse(interaction.summary())).toMatchObject({ translationX: 70, translationY: -25 });
  const pinch = callbacks(child(interaction.transformGesture, 1));
  pinch['onBegin']({});
  pinch['onUpdate']({ scale: 12 });
  pinch['onEnd']({});
  expect(JSON.parse(interaction.summary())).toMatchObject({ scale: 1.6, lastGesture: 'pinch' });
  pinch['onBegin']({});
  pinch['onUpdate']({ scale: 0.01 });
  pinch['onEnd']({});
  expect(JSON.parse(interaction.summary()).scale).toBe(0.75);
});

test('counts only successful tap and long-press completions', async () => {
  const { componentRef } = await setup();
  const interaction = componentRef.instance.demo.interaction;
  const longPress = callbacks(child(interaction.pressGesture, 0));
  const tap = callbacks(child(interaction.pressGesture, 1));
  tap['onBegin']({});
  tap['onEnd']({}, false);
  expect(JSON.parse(interaction.summary()).taps).toBe(0);
  tap['onEnd']({}, true);
  longPress['onBegin']({});
  longPress['onEnd']({}, true);
  expect(JSON.parse(interaction.summary())).toMatchObject({
    taps: 1,
    longPresses: 1,
    lastGesture: 'long-press',
  });
});

test('suspension ignores late completions, and reset does not revive the stale gesture epoch', async () => {
  const { componentRef, active, detectChanges } = await setup();
  const demo = componentRef.instance.demo;
  const pan = callbacks(child(demo.interaction.transformGesture, 0));
  pan['onBegin']({});
  pan['onUpdate']({ translationX: 40, translationY: 0 });
  active.set(false);
  await detectChanges();
  pan['onEnd']({});
  expect(JSON.parse(demo.interaction.summary()).lastGesture).toBeNull();
  active.set(true);
  await detectChanges();
  await demo.perform('spring');
  expect(demo.error()).toContain('Reset the preview');
  await demo.perform('reset');
  pan['onEnd']({});
  expect(JSON.parse(demo.interaction.summary()).lastGesture).toBeNull();
  pan['onBegin']({});
  pan['onUpdate']({ translationX: 20, translationY: 10 });
  pan['onEnd']({});
  await waitFor(() => expect(JSON.parse(demo.interaction.summary()).lastGesture).toBe('pan'));
});

test('destroying the owner ignores subsequent native completion reports', async () => {
  const { componentRef } = await setup();
  const interaction = componentRef.instance.demo.interaction;
  const tap = callbacks(child(interaction.pressGesture, 1));
  tap['onBegin']({});
  componentRef.destroy();
  tap['onEnd']({}, true);
  expect(JSON.parse(interaction.summary()).taps).toBe(0);
});
