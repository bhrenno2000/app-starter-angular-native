import { signal } from '@angular/core';
import * as Picker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useMedia() {
  const preview = signal<string | null>(null);
  const selected = signal<Picker.ImagePickerAsset | null>(null);
  const accept = (result: Picker.ImagePickerResult) => {
    if (result.canceled) return 'Selection cancelled.';
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
  const capture = async (video: boolean) => {
    if (!(await Picker.requestCameraPermissionsAsync()).granted)
      throw new Error('Camera permission was denied. You can enable it in Settings.');
    return accept(
      await Picker.launchCameraAsync({
        mediaTypes: video ? ['videos'] : ['images'],
        videoMaxDuration: 30,
        quality: 0.8,
      }),
    );
  };
  const requireSelection = () => {
    const item = selected();
    if (!item) throw new Error('Select or capture media first.');
    return item;
  };
  return {
    preview: preview.asReadonly(),
    ...useNativeTask([
      { id: 'photo', label: 'Capture photo', run: () => capture(false) },
      { id: 'video', label: 'Record video', run: () => capture(true) },
      {
        id: 'pick',
        label: 'Choose photo or video',
        run: async () =>
          accept(
            await Picker.launchImageLibraryAsync({
              mediaTypes: ['images', 'videos'],
              quality: 0.8,
            }),
          ),
      },
      {
        id: 'resize',
        label: 'Resize image to 720px',
        run: async () => {
          const item = requireSelection();
          if (item.type !== 'image') throw new Error('Choose an image to resize.');
          const context = ImageManipulator.manipulate(item.uri);
          context.resize({ width: 720 });
          const rendered = await context.renderAsync();
          const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
          selected.set({ ...item, ...image });
          preview.set(image.uri);
          context.release();
          rendered.release();
          return image;
        },
      },
      {
        id: 'save',
        label: 'Save to photo library',
        run: async () => {
          const item = requireSelection();
          if (!(await requestPermissionsAsync(true)).granted)
            throw new Error('Photo library permission was denied.');
          const asset = await Asset.create(item.uri);
          return { saved: true, id: asset.id };
        },
      },
      {
        id: 'share',
        label: 'Share selected media',
        run: async () => {
          const item = requireSelection();
          if (!(await Sharing.isAvailableAsync()))
            throw new Error('Sharing is unavailable on this device.');
          await Sharing.shareAsync(item.uri);
          return 'Native share sheet opened.';
        },
      },
    ]),
  };
}
