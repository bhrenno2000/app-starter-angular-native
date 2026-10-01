import { Platform } from 'react-native';
import { registerViewName } from '@ng-native/fabric';
import { registerExpoView } from '@ng-native/expo';
export function initializeNativeViews() {
  registerExpoView('app-native-map', Platform.OS === 'ios' ? 'ExpoAppleMaps' : 'ExpoGoogleMaps');
  registerExpoView('app-native-camera', 'ExpoCamera');
  registerViewName('app-native-web-view', 'RNCWebView', {
    javaScriptEnabled: true,
    messagingEnabled: true,
    domStorageEnabled: true,
  });
  registerExpoView('app-native-video', 'ExpoVideo', { viewName: 'VideoView' });
}
