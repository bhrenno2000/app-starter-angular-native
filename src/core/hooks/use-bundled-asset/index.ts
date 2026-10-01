import { Asset } from 'expo-asset';

export async function useBundledAsset(module: number): Promise<string> {
  let asset = Asset.fromModule(module);
  // Android drawable names work for Image views but not file-consuming native APIs.
  if (!asset.uri.includes(':')) {
    asset = new Asset({ name: asset.name, type: asset.type, uri: asset.uri });
  }
  await asset.downloadAsync();
  if (!asset.localUri?.startsWith('file://'))
    throw new Error('The bundled asset could not be resolved to a local file.');
  return asset.localUri;
}
