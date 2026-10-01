import { registerExpoView } from '@ng-native/expo';
export function initializeNativeViews() {
  registerExpoView('app-native-video', 'ExpoVideo', { viewName: 'VideoView' });
}
