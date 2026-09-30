import type { ExpoConfig } from 'expo/config';
const assets = './assets/images/native';
const config: ExpoConfig = {
  name: 'App Starter Angular Native',
  slug: 'app-starter-angular-native',
  version: '0.1.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  scheme: 'appstarterangular',
  userInterfaceStyle: 'automatic',
  icon: `${assets}/icon.png`,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bhrenno.appstarterangular',
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: 'com.bhrenno.appstarterangular',
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      foregroundImage: `${assets}/android-icon-foreground.png`,
      backgroundImage: `${assets}/android-icon-background.png`,
      monochromeImage: `${assets}/android-icon-monochrome.png`,
      backgroundColor: '#0a0a0a',
    },
  },
  plugins: [
    '@ng-native/metro',
    'expo-font',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: `${assets}/splash.png`,
        imageWidth: 320,
        resizeMode: 'contain',
        backgroundColor: '#fafafa',
        dark: { image: `${assets}/splash.png`, backgroundColor: '#0a0a0a' },
      },
    ],
  ],
};
export default config;
