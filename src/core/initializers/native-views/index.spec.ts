import { beforeEach, describe, expect, it, vi } from 'vitest';
const native = vi.hoisted(() => ({
  platform: { OS: 'android' },
  registerExpoView: vi.fn(),
  registerViewName: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: native.platform }));
vi.mock('@ng-native/expo', () => ({ registerExpoView: native.registerExpoView }));
vi.mock('@ng-native/fabric', () => ({ registerViewName: native.registerViewName }));
import { initializeNativeViews } from './index';
describe('native video platform registration', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses the Android texture view exported by Expo Video', () => {
    native.platform.OS = 'android';
    initializeNativeViews();
    expect(native.registerExpoView).toHaveBeenCalledWith('app-native-video', 'ExpoVideo', {
      viewName: 'TextureVideoView',
    });
    expect(native.registerExpoView).not.toHaveBeenCalledWith('app-native-video', 'ExpoVideo', {
      viewName: 'VideoView',
    });
  });
  it('preserves the existing iOS VideoView', () => {
    native.platform.OS = 'ios';
    initializeNativeViews();
    expect(native.registerExpoView).toHaveBeenCalledWith('app-native-video', 'ExpoVideo', {
      viewName: 'VideoView',
    });
  });
});
