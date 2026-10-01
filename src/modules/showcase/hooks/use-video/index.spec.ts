import { Component } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
const native = vi.hoisted(() => ({
  released: false,
  pause: vi.fn(),
  release: vi.fn(),
  create: vi.fn(),
}));
vi.mock('expo-video', () => ({ createVideoPlayer: native.create }));
vi.mock('expo-document-picker', () => ({ getDocumentAsync: vi.fn() }));
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
