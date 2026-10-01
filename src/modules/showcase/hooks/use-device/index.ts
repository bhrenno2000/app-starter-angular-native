import { DestroyRef, inject } from '@angular/core';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Localization from 'expo-localization';
import * as Orientation from 'expo-screen-orientation';
import * as Speech from 'expo-speech';
import * as Browser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useDevice() {
  inject(DestroyRef).onDestroy(() => {
    void Speech.stop();
    void Orientation.unlockAsync();
  });
  return useNativeTask([
    {
      id: 'info',
      label: 'Read device and application info',
      run: () => ({
        model: Device.modelName,
        os: Device.osName,
        version: Device.osVersion,
        physicalDevice: Device.isDevice,
        app: Application.applicationName,
        appVersion: Application.nativeApplicationVersion,
        locales: Localization.getLocales(),
      }),
    },
    {
      id: 'battery',
      label: 'Read battery and power state',
      run: async () => ({
        level: await Battery.getBatteryLevelAsync(),
        lowPower: await Battery.isLowPowerModeEnabledAsync(),
      }),
    },
    {
      id: 'brightness',
      label: 'Read screen brightness',
      run: () => Brightness.getBrightnessAsync(),
    },
    {
      id: 'haptic',
      label: 'Trigger selection haptic',
      run: async () => {
        await Haptics.selectionAsync();
        return 'Selection feedback triggered.';
      },
    },
    {
      id: 'success',
      label: 'Trigger success haptic',
      run: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return 'Success feedback triggered.';
      },
    },
    {
      id: 'copy',
      label: 'Copy demo text',
      run: async () => {
        await Clipboard.setStringAsync('Built with Angular Native');
        return 'Demo text copied.';
      },
    },
    { id: 'paste', label: 'Read clipboard', run: () => Clipboard.getStringAsync() },
    {
      id: 'speak',
      label: 'Speak a sentence',
      run: () => {
        Speech.speak('This native application is rendered with Angular.', { language: 'en-US' });
        return 'Speech started.';
      },
    },
    {
      id: 'stop-speech',
      label: 'Stop speaking',
      run: async () => {
        await Speech.stop();
        return 'Speech stopped.';
      },
    },
    {
      id: 'landscape',
      label: 'Rotate to landscape',
      run: async () => {
        await Orientation.lockAsync(Orientation.OrientationLock.LANDSCAPE);
        return 'Landscape orientation locked.';
      },
    },
    {
      id: 'portrait',
      label: 'Restore portrait',
      run: async () => {
        await Orientation.lockAsync(Orientation.OrientationLock.PORTRAIT_UP);
        return 'Portrait orientation restored.';
      },
    },
    {
      id: 'browser',
      label: 'Open in-app browser',
      run: () => Browser.openBrowserAsync('https://angular.dev'),
    },
    {
      id: 'settings',
      label: 'Open application settings',
      run: async () => {
        await Linking.openSettings();
        return 'Application settings opened.';
      },
    },
  ]);
}
