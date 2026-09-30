import { AppRegistry, Image, Platform, processColor } from 'react-native';
import * as Font from 'expo-font';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { getFabricUIManager, registerPlatformComponents } from '@ng-native/fabric';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { nativeStorage } from '@/core/storage/native-storage';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import tailwind from '../.angular-native/app.tailwind.js';
registerPlatformComponents(Platform.OS);
AppRegistry.registerRunnable('main', ({ rootTag }: { rootTag: number | string }) => {
  void Font.loadAsync({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  })
    .then(() => {
      const app = mount(Number(rootTag), App, getFabricUIManager(), {
        processColor,
        globalStyles: tailwind,
        conditions: currentConditions(),
        tokens: deviceTokens(),
        resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
        providers: [...appConfig.providers, { provide: APP_STORAGE, useValue: nativeStorage }],
      });
      watchConditions(app.engine);
    })
    .catch((error: unknown) => {
      console.error('Unable to start Angular Native', error);
    });
});
