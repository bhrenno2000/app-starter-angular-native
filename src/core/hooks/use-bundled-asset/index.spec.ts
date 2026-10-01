import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fromModule: vi.fn(), materialize: vi.fn() }));
vi.mock('expo-asset', () => ({
  Asset: class {
    static fromModule = mocks.fromModule;
    localUri: string | null = null;
    constructor(public descriptor: { name: string; type: string; uri: string }) {}
    async downloadAsync() {
      this.localUri = await mocks.materialize(this.descriptor);
      return this;
    }
  },
}));
import { useBundledAsset } from './index';
describe('bundled native file resolution', () => {
  beforeEach(() => vi.resetAllMocks());
  it('materializes drawable names even when the image asset reports itself downloaded', async () => {
    const downloadAsync = vi.fn();
    mocks.fromModule.mockReturnValue({
      name: 'qr',
      type: 'png',
      uri: 'assets_qr',
      localUri: 'assets_qr',
      downloaded: true,
      downloadAsync,
    });
    mocks.materialize.mockResolvedValue('file:///cache/qr.png');
    expect(await useBundledAsset(42)).toBe('file:///cache/qr.png');
    expect(mocks.materialize).toHaveBeenCalledWith({ name: 'qr', type: 'png', uri: 'assets_qr' });
    expect(downloadAsync).not.toHaveBeenCalled();
  });
  it('keeps normal bundled file resolution on iOS', async () => {
    const asset = {
      uri: 'file:///bundle/qr.png',
      localUri: 'file:///bundle/qr.png',
      downloadAsync: vi.fn().mockResolvedValue(undefined),
    };
    mocks.fromModule.mockReturnValue(asset);
    expect(await useBundledAsset(42)).toBe(asset.localUri);
    expect(asset.downloadAsync).toHaveBeenCalledOnce();
    expect(mocks.materialize).not.toHaveBeenCalled();
  });
  it('rejects a result that is still an inaccessible resource name', async () => {
    mocks.fromModule.mockReturnValue({ name: 'qr', type: 'png', uri: 'assets_qr' });
    mocks.materialize.mockResolvedValue('assets_qr');
    await expect(useBundledAsset(42)).rejects.toThrow('local file');
  });
  it('preserves native extraction failures', async () => {
    mocks.fromModule.mockReturnValue({ name: 'qr', type: 'png', uri: 'assets_qr' });
    mocks.materialize.mockRejectedValue(new Error('Resource missing'));
    await expect(useBundledAsset(42)).rejects.toThrow('Resource missing');
  });
});
