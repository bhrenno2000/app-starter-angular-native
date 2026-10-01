import { computed, signal } from '@angular/core';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import { useVideo } from '../use-video';
import * as Picker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useMedia() {
  const video = useVideo();
  const lifecycle = useScreenLifecycle(video.pause);
  const preview = signal<string | null>(null);
  const selected = signal<Picker.ImagePickerAsset | null>(null);
  const accept = (result: Picker.ImagePickerResult) => {
    if (result.canceled) return 'Selection cancelled.';
    video.pause();
    const asset = result.assets[0];
    selected.set(asset);
    preview.set(asset.type === 'image' ? asset.uri : null);
    return {
      type: asset.type,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      uri: asset.uri,
    };
  };
  const capture = async (recording: boolean) => {
    lifecycle.assertActive();
    const permitted = lifecycle.checkpoint();
    const currentScreen = lifecycle.navigationCheckpoint();
    if (!(await Picker.requestCameraPermissionsAsync()).granted)
      throw new Error('Camera permission was denied. You can enable it in Settings.');
    if (!permitted()) return 'Capture cancelled because this screen is no longer active.';
    video.pause();
    const result = await Picker.launchCameraAsync({
      mediaTypes: recording ? ['videos'] : ['images'],
      videoMaxDuration: 30,
      quality: 0.8,
    });
    return currentScreen() ? accept(result) : 'Capture cancelled because this screen changed.';
  };
  const requireSelection = () => {
    const item = selected();
    if (!item) throw new Error('Select or capture media first.');
    return item;
  };
  return {
    preview: preview.asReadonly(),
    videoId: computed(() => (selected()?.type === 'video' ? video.videoId() : null)),
    reading: video.reading,
    ...useNativeTask([
      { id: 'photo', label: 'Capture photo', run: () => capture(false) },
      { id: 'video', label: 'Record video', run: () => capture(true) },
      {
        id: 'pick',
        label: 'Choose photo or video',
        run: async () => {
          lifecycle.assertActive();
          const currentScreen = lifecycle.navigationCheckpoint();
          video.pause();
          const result = await Picker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            quality: 0.8,
          });
          return currentScreen()
            ? accept(result)
            : 'Selection cancelled because this screen changed.';
        },
      },
      {
        id: 'play',
        label: 'Play selected video',
        run: async () => {
          const item = requireSelection();
          if (item.type !== 'video') throw new Error('Capture or choose a video first.');
          return video.load(item.uri);
        },
      },
      {
        id: 'pause',
        label: 'Pause selected video',
        run: () => {
          video.pause();
          return 'Playback paused.';
        },
      },
      {
        id: 'resize',
        label: 'Resize image to 720px',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const item = requireSelection();
          if (item.type !== 'image') throw new Error('Choose an image to resize.');
          const context = ImageManipulator.manipulate(item.uri);
          context.resize({ width: 720 });
          try {
            const rendered = await context.renderAsync();
            try {
              const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
              if (!active()) return 'Resize cancelled because this screen is no longer active.';
              selected.set({ ...item, ...image });
              preview.set(image.uri);
              return image;
            } finally {
              rendered.release();
            }
          } finally {
            context.release();
          }
        },
      },
      {
        id: 'save',
        label: 'Save to photo library',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const item = requireSelection();
          if (!(await requestPermissionsAsync(true)).granted)
            throw new Error('Photo library permission was denied.');
          if (!active()) return 'Save cancelled because this screen is no longer active.';
          const asset = await Asset.create(item.uri);
          return { saved: true, id: asset.id };
        },
      },
      {
        id: 'share',
        label: 'Share selected media',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const item = requireSelection();
          if (!(await Sharing.isAvailableAsync()))
            throw new Error('Sharing is unavailable on this device.');
          if (!active()) return 'Sharing cancelled because this screen is no longer active.';
          await Sharing.shareAsync(item.uri);
          return 'The native share sheet closed.';
        },
      },
    ]),
  };
}
