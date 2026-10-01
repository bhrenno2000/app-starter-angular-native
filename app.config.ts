import type { ExpoConfig } from 'expo/config';
const assets = './assets/images/native';
const config: ExpoConfig = {
  name: 'App Starter Angular Native',
  slug: 'app-starter-angular-native',
  version: '0.1.0',
  platforms: ['ios', 'android'],
  orientation: 'default',
  scheme: 'appstarterangular',
  userInterfaceStyle: 'automatic',
  icon: `${assets}/icon.png`,
  extra: {
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      ? { eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID } }
      : {}),
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bhrenno.appstarterangular',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIViewControllerBasedStatusBarAppearance: false,
    },
  },
  android: {
    package: 'com.bhrenno.appstarterangular',
    config: process.env.GOOGLE_MAPS_API_KEY
      ? { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } }
      : undefined,
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
    './plugins/native-status-bar/index.cjs',
    '@ng-native/metro',
    [
      'react-native-ble-plx',
      {
        isBackgroundEnabled: false,
        bluetoothAlwaysPermission:
          'Discover and connect to BLE peripherals only when you run the Bluetooth demonstration.',
      },
    ],
    'expo-asset',
    ['expo-maps', { requestLocationPermission: false }],
    [
      'expo-camera',
      {
        cameraPermission:
          'Scan codes with the live camera when you start the camera demonstration.',
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'Capture photos and videos for native demonstrations.',
        microphonePermission: 'Record audio for native demonstrations.',
        photosPermission: 'Choose media for native demonstrations.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'Browse media for native demonstrations.',
        savePhotosPermission: 'Save media you choose to your photo library.',
      },
    ],
    [
      'expo-local-authentication',
      { faceIDPermission: 'Authenticate for the biometric demonstration.' },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Show your location when you run the location demonstration.',
      },
    ],
    [
      'expo-contacts',
      { contactsPermission: 'Read contacts only when you run the contacts demonstration.' },
    ],
    [
      'expo-calendar',
      {
        calendarPermission: 'Read or create events when you run the calendar demonstration.',
        remindersPermission: 'Access reminders when you run the reminders demonstration.',
      },
    ],
    ['expo-sensors', { motionPermission: 'Read motion and steps for the sensor demonstration.' }],
    'expo-notifications',
    'expo-sharing',
    'expo-mail-composer',
    'expo-audio',
    'expo-video',
    'expo-web-browser',
    'expo-localization',
    'expo-sqlite',

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
