import { DestroyRef, inject, signal } from '@angular/core';
import { createVideoPlayer } from 'expo-video';
import * as Documents from 'expo-document-picker';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { NativeVideoHandle, VideoSource } from './types';
export function useVideo() {
  const player = createVideoPlayer(null);
  let released = false;
  const pause = () => {
    if (!released) player.pause();
  };
  const videoId = signal<number | null>(null);
  const reading = signal<string | null>(null);
  let cancelLoading: (() => void) | null = null;
  const lifecycle = useScreenLifecycle(() => {
    pause();
    cancelLoading?.();
  });
  player.timeUpdateEventInterval = 0.5;
  const status = player.addListener('statusChange', ({ status, error }) => {
    reading.set(error ? error.message : status);
  });
  const progress = player.addListener('timeUpdate', ({ currentTime }) => {
    reading.set(
      JSON.stringify({ playing: player.playing, currentTime, duration: player.duration }),
    );
  });
  inject(DestroyRef).onDestroy(() => {
    released = true;
    status.remove();
    progress.remove();
    player.release();
  });
  const waitUntilReady = () =>
    new Promise<void>((resolve, reject) => {
      if (player.status === 'readyToPlay') {
        resolve();
        return;
      }
      if (player.status === 'error') {
        reject(new Error(reading() ?? 'The video could not be loaded.'));
        return;
      }
      const subscription = player.addListener('statusChange', ({ status, error }) => {
        if (status === 'readyToPlay') {
          finish();
          resolve();
        }
        if (status === 'error') {
          finish();
          reject(new Error(error?.message ?? 'The video could not be loaded.'));
        }
      });
      const timeout = setTimeout(() => {
        finish();
        reject(new Error('Video loading timed out.'));
      }, 30_000);
      const finish = () => {
        clearTimeout(timeout);
        subscription.remove();
        cancelLoading = null;
      };
      cancelLoading = () => {
        finish();
        reject(new Error('Video loading cancelled because this screen is no longer active.'));
      };
    });
  const load = async (source: VideoSource) => {
    lifecycle.assertActive();
    const active = lifecycle.checkpoint();
    videoId.set(null);
    await player.replaceAsync(source);
    await waitUntilReady();
    if (!active()) return 'Loading cancelled because this screen is no longer active.';
    const id = (player as unknown as NativeVideoHandle).__expo_shared_object_id__;
    if (typeof id !== 'number') throw new Error('The native video player is unavailable.');
    videoId.set(id);
    player.loop = true;
    player.play();
    return 'Native video playback started.';
  };
  return {
    load,
    pause,
    videoId: videoId.asReadonly(),
    reading: reading.asReadonly(),
    ...useNativeTask([
      {
        id: 'sample',
        label: 'Play sample video',
        run: () => load(require('../../../../../assets/media/angular-native-demo.mp4')),
      },
      {
        id: 'pick',
        label: 'Pick and play a video',
        run: async () => {
          const active = lifecycle.checkpoint();
          const result = await Documents.getDocumentAsync({
            type: 'video/*',
            copyToCacheDirectory: true,
          });
          if (result.canceled) return 'Selection cancelled.';
          if (!active()) return 'Selection cancelled because this screen is no longer active.';
          return load(result.assets[0].uri);
        },
      },
      {
        id: 'play',
        label: 'Resume video',
        run: () => {
          lifecycle.assertActive();
          if (videoId() === null) throw new Error('Load a video first.');
          player.play();
          return 'Playback resumed.';
        },
      },
      {
        id: 'pause',
        label: 'Pause video',
        run: () => {
          pause();
          return 'Playback paused.';
        },
      },
      {
        id: 'seek',
        label: 'Seek forward 10 seconds',
        run: () => {
          if (videoId() === null) throw new Error('Load a video first.');
          player.seekBy(10);
          return { currentTime: player.currentTime };
        },
      },
      {
        id: 'mute',
        label: 'Toggle video sound',
        run: () => {
          player.muted = !player.muted;
          return { muted: player.muted };
        },
      },
    ]),
  };
}
