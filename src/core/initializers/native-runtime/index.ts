import { AppRegistry, Image, Platform, processColor } from 'react-native';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { getFabricUIManager, registerPlatformComponents } from '@ng-native/fabric';
import { App } from '@/app/app';
import { appConfig } from '@/app/app.config';
import { initializeNativeViews } from '../native-views';
import { initializeSplash, prepareSplash } from '../splash';
import { initializeFonts } from '../fonts';
import type { NativeRoot } from './types';
import tailwind from '../../../../.angular-native/app.tailwind.js';
export function initializeNativeRuntime() {
  prepareSplash();
  registerPlatformComponents(Platform.OS);
  initializeNativeViews();
  AppRegistry.registerRunnable('main', ({ rootTag }: NativeRoot) => {
    void initializeFonts()
      .then(() => {
        const app = mount(Number(rootTag), App, getFabricUIManager(), {
          processColor,
          globalStyles: tailwind,
          conditions: currentConditions(),
          tokens: deviceTokens(),
          resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
          providers: appConfig.providers,
        });
        watchConditions(app.engine);
        initializeSplash(app);
      })
      .catch((error: unknown) => {
        console.error('Unable to start Angular Native', error);
      });
  });
}
