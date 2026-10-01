import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
const native = vi.hoisted(() => ({
  permission: vi.fn(),
  camera: vi.fn(),
  picker: vi.fn(),
  load: vi.fn(),
  pause: vi.fn(),
  libraryPermission: vi.fn(),
  create: vi.fn(),
  manipulate: vi.fn(),
}));
vi.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: native.permission,
  launchCameraAsync: native.camera,
  launchImageLibraryAsync: native.picker,
}));
vi.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: native.manipulate },
  SaveFormat: { JPEG: 'jpeg' },
}));
vi.mock('expo-media-library', () => ({
  Asset: { create: native.create },
  requestPermissionsAsync: native.libraryPermission,
}));
vi.mock('expo-sharing', () => ({ isAvailableAsync: vi.fn(), shareAsync: vi.fn() }));
vi.mock('../use-video', () => ({
  useVideo: () => ({
    load: native.load,
    pause: native.pause,
    videoId: () => 7,
    reading: () => null,
  }),
}));
import { useMedia } from './index';
@Component({ selector: 'test-media-hook', template: '' })
class Host {
  readonly demo = useMedia();
}
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  native.permission.mockResolvedValue({ granted: true });
  native.camera.mockResolvedValue({
    canceled: false,
    assets: [
      { type: 'video', uri: 'file:///capture.mp4', width: 720, height: 1280, duration: 1000 },
    ],
  });
  native.load.mockResolvedValue('Native video playback started.');
});
async function setup() {
  const front = signal(true);
  const foreground = signal(true);
  const host = await render(Host, {
    providers: [
      { provide: SCREEN_IN_FRONT, useValue: front },
      { provide: AppState, useValue: { active: foreground } },
    ],
  });
  return { ...host, front, foreground, demo: host.componentRef.instance.demo };
}
test('plays a captured video through the video facade', async () => {
  const { demo } = await setup();
  await demo.perform('video');
  expect(native.camera).toHaveBeenCalledWith(
    expect.objectContaining({ mediaTypes: ['videos'], videoMaxDuration: 30 }),
  );
  await demo.perform('play');
  expect(native.load).toHaveBeenCalledWith('file:///capture.mp4');
  expect(demo.videoId()).toBe(7);
  expect(demo.output()).toBe('Native video playback started.');
});
test('denied camera permission does not launch the camera', async () => {
  native.permission.mockResolvedValue({ granted: false });
  const { demo } = await setup();
  await demo.perform('photo');
  expect(native.camera).not.toHaveBeenCalled();
  expect(demo.error()).toContain('Camera permission was denied');
});
test('leaving while permission is pending prevents late camera activation', async () => {
  let resolve = (_: { granted: boolean }) => {};
  native.permission.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { demo, front, detectChanges } = await setup();
  const action = demo.perform('photo');
  front.set(false);
  await detectChanges();
  resolve({ granted: true });
  await action;
  expect(native.camera).not.toHaveBeenCalled();
});
test('accepts a native camera result after its expected background/foreground transition', async () => {
  let resolve = (_: unknown) => {};
  native.camera.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { demo, foreground, detectChanges } = await setup();
  const action = demo.perform('photo');
  await vi.waitFor(() => expect(native.camera).toHaveBeenCalledOnce());
  foreground.set(false);
  await detectChanges();
  foreground.set(true);
  await detectChanges();
  resolve({
    canceled: false,
    assets: [{ type: 'image', uri: 'file:///photo.jpg', width: 720, height: 720 }],
  });
  await action;
  expect(demo.preview()).toBe('file:///photo.jpg');
  expect(demo.videoId()).toBeNull();
});
test('rejects camera results after navigating away and back', async () => {
  let resolve = (_: unknown) => {};
  native.camera.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { demo, front, detectChanges } = await setup();
  const action = demo.perform('photo');
  await vi.waitFor(() => expect(native.camera).toHaveBeenCalledOnce());
  front.set(false);
  await detectChanges();
  front.set(true);
  await detectChanges();
  resolve({ canceled: false, assets: [{ type: 'image', uri: 'file:///stale.jpg' }] });
  await action;
  expect(demo.preview()).toBeNull();
  expect(demo.output()).toContain('screen changed');
});
test('navigation during save permission prevents a late library write', async () => {
  let resolve = (_: { granted: boolean }) => {};
  native.libraryPermission.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { demo, front, detectChanges } = await setup();
  await demo.perform('video');
  const action = demo.perform('save');
  front.set(false);
  await detectChanges();
  resolve({ granted: true });
  await action;
  expect(native.create).not.toHaveBeenCalled();
});

test('a replacement selection hides the previous video until the new source is loaded', async () => {
  const { demo } = await setup();
  await demo.perform('video');
  expect(demo.videoId()).toBeNull();
  await demo.perform('play');
  expect(demo.videoId()).toBe(7);
  native.camera.mockResolvedValue({
    canceled: false,
    assets: [{ type: 'video', uri: 'file:///replacement.mp4', width: 720, height: 1280 }],
  });
  await demo.perform('video');
  expect(demo.videoId()).toBeNull();
  await demo.perform('play');
  expect(native.load).toHaveBeenLastCalledWith('file:///replacement.mp4');
  expect(demo.videoId()).toBe(7);
});
