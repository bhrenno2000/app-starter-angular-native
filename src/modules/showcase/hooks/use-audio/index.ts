import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import { DestroyRef, inject, signal } from '@angular/core';
import { AudioModule, createAudioPlayer, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import * as Documents from 'expo-document-picker';
import { useNativeTask } from '@/core/hooks/use-native-task';
import type { AudioPlayer, AudioRecorder } from './types';
export function useAudio() {
  let recorder: AudioRecorder | null = null;
  let player: AudioPlayer | null = null;
  let uri: string | null = null;
  const reading = signal<string | null>(null);
  let stopping: Promise<void> = Promise.resolve();
  const stopRecording = () => {
    const current = recorder;
    recorder = null;
    if (!current) return stopping;
    stopping = (async () => {
      try {
        if (current.isRecording) await current.stop();
        uri = current.uri;
      } finally {
        current.release();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      }
    })();
    return stopping;
  };
  const lifecycle = useScreenLifecycle(() => {
    player?.pause();
    void stopRecording().catch((error: unknown) => {
      reading.set(error instanceof Error ? error.message : 'Unable to stop audio recording.');
    });
  });
  inject(DestroyRef).onDestroy(() => player?.remove());
  return {
    reading: reading.asReadonly(),
    ...useNativeTask([
      {
        id: 'record',
        label: 'Start microphone recording',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          if (recorder?.isRecording) throw new Error('A recording is already active.');
          if (!(await AudioModule.requestRecordingPermissionsAsync()).granted)
            throw new Error('Microphone permission was denied.');
          await stopping;
          if (!active()) return 'Recording cancelled because this screen is no longer active.';
          await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
          const preset = RecordingPresets.HIGH_QUALITY;
          const created = new AudioModule.AudioRecorder({
            ...preset,
            ...(Platform.OS === 'ios' ? preset.ios : preset.android),
          });
          try {
            await created.prepareToRecordAsync();
            if (!active()) {
              await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
              created.release();
              return 'Recording cancelled because this screen is no longer active.';
            }
            recorder = created;
            recorder.record();
          } catch (error) {
            if (recorder === created) recorder = null;
            created.release();
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
            throw error;
          }
          return 'Microphone recording started. Stop it to play the recording.';
        },
      },
      {
        id: 'stop',
        label: 'Stop recording',
        run: async () => {
          if (!recorder?.isRecording) throw new Error('Start a recording first.');
          await stopRecording();
          return { uri };
        },
      },
      {
        id: 'pick',
        label: 'Pick an audio file',
        run: async () => {
          const result = await Documents.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
          });
          if (result.canceled) return 'Selection cancelled.';
          uri = result.assets[0].uri;
          return { name: result.assets[0].name };
        },
      },
      {
        id: 'play',
        label: 'Play selected audio',
        run: () => {
          lifecycle.assertActive();
          if (!uri) throw new Error('Record or pick an audio file first.');
          player?.remove();
          player = createAudioPlayer(uri);
          player.play();
          return 'Audio playback started.';
        },
      },
      {
        id: 'pause',
        label: 'Pause playback',
        run: () => {
          player?.pause();
          return 'Audio paused.';
        },
      },
    ]),
  };
}
