import { inject, signal } from '@angular/core';
import { Album, Asset, AssetField, Query, requestPermissionsAsync } from 'expo-media-library';
import { Asset as BundledAsset } from 'expo-asset';
import { Platform } from 'react-native';
import { z } from 'zod';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { useNativeTask } from '@/core/hooks/use-native-task';
import type { GalleryOwnership } from './types';
const KEY = 'showcase-gallery-ownership';
export function useGallery() {
  const storage = inject(APP_STORAGE);
  const preview = signal<string | null>(null);
  let page = 0;
  const schema: z.ZodType<GalleryOwnership> = z.object({
    albumId: z.string().nullable(),
    assetIds: z.array(z.string()),
  });
  const ownership = () => {
    const saved = storage.get(KEY);
    return saved ? schema.parse(JSON.parse(saved)) : { albumId: null, assetIds: [] };
  };
  const save = (value: GalleryOwnership) => storage.set(KEY, JSON.stringify(value));
  const permit = async () => {
    if (!(await requestPermissionsAsync(false, ['photo', 'video'])).granted)
      throw new Error('Photo library permission was denied.');
  };
  const album = () => {
    const id = ownership().albumId;
    if (!id) throw new Error('Create the demo album first.');
    return new Album(id);
  };
  const readPage = async () => {
    await permit();
    return {
      page: page + 1,
      pageSize: 20,
      assets: await new Query()
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .offset(page * 20)
        .limit(20)
        .exeForMetadata(),
    };
  };
  const sample = async () => {
    const asset = BundledAsset.fromModule(require('../../../../../assets/images/native/icon.png'));
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error('The demo image could not be loaded.');
    preview.set(asset.localUri);
    return asset.localUri;
  };
  return {
    preview: preview.asReadonly(),
    ...useNativeTask([
      {
        id: 'first',
        label: 'Read first library page',
        run: () => {
          page = 0;
          return readPage();
        },
      },
      {
        id: 'next',
        label: 'Read next library page',
        run: () => {
          page++;
          return readPage();
        },
      },
      {
        id: 'albums',
        label: 'List photo albums',
        run: async () => {
          await permit();
          const albums = (await Album.getAll()).slice(0, 30);
          return Promise.all(
            albums.map(async (item) => ({ id: item.id, title: await item.getTitle() })),
          );
        },
      },
      {
        id: 'create-album',
        label: 'Create demo album with sample image',
        run: async () => {
          await permit();
          const owned = ownership();
          if (owned.albumId) return { id: owned.albumId, title: await album().getTitle() };
          const created = await Album.create('Angular Native Showcase', [await sample()], false);
          const ids = (await created.getAssets()).map((item) => item.id);
          save({ albumId: created.id, assetIds: ids });
          return { albumId: created.id, sampleAssets: ids.length };
        },
      },
      {
        id: 'add',
        label: 'Add another sample image to demo album',
        run: async () => {
          await permit();
          const target = album();
          const owned = ownership();
          const created = await Asset.create(await sample(), target);
          save({ ...owned, assetIds: [...owned.assetIds, created.id] });
          return { assetId: created.id, albumId: target.id };
        },
      },
      {
        id: 'read-album',
        label: 'Read demo album metadata',
        run: async () => {
          await permit();
          return new Query().album(album()).limit(30).exeForMetadata();
        },
      },
      {
        id: 'favorite',
        label: 'Toggle favorite on last demo image',
        run: async () => {
          if (Platform.OS !== 'ios')
            throw new Error('Media-library favorites are available on iOS.');
          await permit();
          const id = ownership().assetIds.at(-1);
          if (!id) throw new Error('Create a demo image first.');
          const image = new Asset(id);
          const favorite = !(await image.getFavorite());
          await image.setFavorite(favorite);
          return { assetId: id, favorite };
        },
      },
      {
        id: 'details',
        label: 'Inspect last demo image',
        run: async () => {
          await permit();
          const id = ownership().assetIds.at(-1);
          if (!id) throw new Error('Create a demo image first.');
          return new Asset(id).getInfo();
        },
      },
    ]),
  };
}
