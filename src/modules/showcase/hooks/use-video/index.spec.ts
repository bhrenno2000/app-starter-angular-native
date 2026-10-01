import { Component, signal } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
const native = vi.hoisted(() => ({
  released: false,
  pause: vi.fn(),
  release: vi.fn(),
  create: vi.fn(),
  pick: vi.fn(),
  replace: vi.fn(),
  play: vi.fn(),
}));
vi.mock('expo-video', () => ({ createVideoPlayer: native.create }));
vi.mock('expo-document-picker', () => ({ getDocumentAsync: native.pick }));
import { useVideo } from './index';
@Component({ selector: 'test-video-owner', template: '' })
class Host {
  readonly video = useVideo();
  readonly mediaLifecycle = useScreenLifecycle(this.video.pause);
}
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  native.released = false;
  native.pause.mockImplementation(() => {
    if (native.released) throw new Error('Cannot use shared object that was already released');
  });
  native.release.mockImplementation(() => {
    native.released = true;
  });
  native.create.mockReturnValue({
    pause: native.pause,
    replaceAsync: native.replace,
    play: native.play,
    status: 'readyToPlay',
    __expo_shared_object_id__: 7,
    release: native.release,
    addListener: () => ({ remove: vi.fn() }),
    timeUpdateEventInterval: 0,
  });
});
test('later owner cleanup does not pause a released native player', async () => {
  const { componentRef } = await render(Host);
  const video = componentRef.instance.video;
  expect(() => componentRef.destroy()).not.toThrow();
  expect(native.release).toHaveBeenCalledOnce();
  expect(native.pause).toHaveBeenCalledOnce();
  expect(() => video.pause()).not.toThrow();
  expect(native.pause).toHaveBeenCalledOnce();
});

test('accepts a selected video after the document picker backgrounds the app', async () => {
  const foreground = signal(true);
  let resolve = (_: unknown) => {};
  native.pick.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { componentRef, detectChanges } = await render(Host, {
    providers: [{ provide: AppState, useValue: { active: foreground } }],
  });
  const action = componentRef.instance.video.perform('pick');
  foreground.set(false);
  await detectChanges();
  foreground.set(true);
  await detectChanges();
  resolve({ canceled: false, assets: [{ uri: 'file:///selected.mp4' }] });
  await action;
  expect(native.replace).toHaveBeenCalledWith('file:///selected.mp4');
  expect(native.play).toHaveBeenCalledOnce();
});

test('rejects document selection after navigating away and back', async () => {
  const front = signal(true);
  let resolve = (_: unknown) => {};
  native.pick.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { componentRef, detectChanges } = await render(Host, {
    providers: [{ provide: SCREEN_IN_FRONT, useValue: front }],
  });
  const action = componentRef.instance.video.perform('pick');
  front.set(false);
  await detectChanges();
  front.set(true);
  await detectChanges();
  resolve({ canceled: false, assets: [{ uri: 'file:///stale.mp4' }] });
  await action;
  expect(native.replace).not.toHaveBeenCalled();
  expect(componentRef.instance.video.output()).toContain('no longer active');
});
