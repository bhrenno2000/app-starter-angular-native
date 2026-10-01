import { DestroyRef, computed, inject, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import * as ScreenCapture from 'expo-screen-capture';
import * as KeepAwake from 'expo-keep-awake';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { ScreenPolicyState, ScreenshotSubscription } from './types';
export function useScreenControls() {
  const screen = inject(SCREEN_IN_FRONT);
  const app = inject(AppState);
  const key = `showcase-screen-${Crypto.randomUUID()}`;
  const state = signal<ScreenPolicyState>({
    awake: false,
    blocked: false,
    switcherProtected: false,
    observing: false,
    screenshots: 0,
    cleanupError: null,
  });
  let observer: ScreenshotSubscription | null = null;
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (operation: () => Promise<void>) => {
    queue = queue.catch(() => {}).then(operation);
    return queue;
  };
  const rememberError = (error: unknown) =>
    state.update((value) => ({
      ...value,
      cleanupError: error instanceof Error ? error.message : 'Screen cleanup failed.',
    }));
  const stopObserver = () => {
    observer?.remove();
    observer = null;
    state.update((value) => ({ ...value, observing: false }));
  };
  const releasePrivacy = async () => {
    if (state().blocked) {
      await ScreenCapture.allowScreenCaptureAsync(key);
      state.update((value) => ({ ...value, blocked: false }));
    }
    if (state().switcherProtected) {
      await ScreenCapture.disableAppSwitcherProtectionAsync();
      state.update((value) => ({ ...value, switcherProtected: false }));
    }
  };
  const releaseAwake = async () => {
    if (state().awake) {
      await KeepAwake.deactivateKeepAwake(key);
      state.update((value) => ({ ...value, awake: false }));
    }
  };
  const lifecycle = useScreenLifecycle(() => {
    stopObserver();
    void enqueue(async () => {
      await releaseAwake();
      if (!screen()) await releasePrivacy();
    }).catch(rememberError);
  });
  inject(DestroyRef).onDestroy(() => {
    void enqueue(releasePrivacy).catch(rememberError);
  });
  const reading = computed(() =>
    JSON.stringify({ appState: app.current(), screenInFront: screen(), ...state() }, null, 2),
  );
  return {
    reading,
    ...useNativeTask([
      {
        id: 'awake',
        label: 'Keep this screen awake',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          await enqueue(async () => {
            if (!active()) throw new Error('This screen is no longer active.');
            if (!(await KeepAwake.isAvailableAsync()))
              throw new Error('Keep-awake is unavailable.');
            await KeepAwake.activateKeepAwakeAsync(key);
            state.update((value) => ({ ...value, awake: true }));
            if (!active()) await releaseAwake();
          });
          return state();
        },
      },
      {
        id: 'sleep',
        label: 'Allow this screen to sleep',
        run: async () => {
          await enqueue(releaseAwake);
          return state();
        },
      },
      {
        id: 'block',
        label: 'Block screenshots and recording',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          await enqueue(async () => {
            if (!active()) throw new Error('This screen is no longer active.');
            if (!(await ScreenCapture.isAvailableAsync()))
              throw new Error('Screen-capture protection is unavailable.');
            await ScreenCapture.preventScreenCaptureAsync(key);
            state.update((value) => ({ ...value, blocked: true }));
            if (!active()) await releasePrivacy();
          });
          return state();
        },
      },
      {
        id: 'allow',
        label: 'Allow screenshots and recording',
        run: async () => {
          await enqueue(releasePrivacy);
          return state();
        },
      },
      {
        id: 'switcher',
        label: 'Protect app switcher preview',
        run: async () => {
          lifecycle.assertActive();
          if (Platform.OS !== 'ios')
            throw new Error(
              'On Android, app-switcher protection uses Block screenshots and recording.',
            );
          const active = lifecycle.checkpoint();
          await enqueue(async () => {
            if (!active()) throw new Error('This screen is no longer active.');
            await ScreenCapture.enableAppSwitcherProtectionAsync(0.8);
            state.update((value) => ({ ...value, switcherProtected: true }));
            if (!screen()) await releasePrivacy();
          });
          return 'App-switcher protection enabled. It stays enabled while this page is selected, including in the background.';
        },
      },
      {
        id: 'observe',
        label: 'Observe screenshot events',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          if (!(await ScreenCapture.requestPermissionsAsync()).granted)
            throw new Error('Screenshot observation permission was denied.');
          if (!active()) return 'Observation cancelled because this screen is no longer active.';
          stopObserver();
          observer = ScreenCapture.addScreenshotListener(() =>
            state.update((value) => ({ ...value, screenshots: value.screenshots + 1 })),
          );
          state.update((value) => ({ ...value, observing: true }));
          return 'Screenshot observer active. Trigger a system screenshot to inspect its count.';
        },
      },
      {
        id: 'stop-observer',
        label: 'Stop screenshot observer',
        run: () => {
          stopObserver();
          return state();
        },
      },
      { id: 'state', label: 'Inspect app and screen lifecycle', run: () => JSON.parse(reading()) },
    ]),
  };
}
