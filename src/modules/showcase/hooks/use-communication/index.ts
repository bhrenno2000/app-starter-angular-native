import { Platform } from 'react-native';
import * as Mail from 'expo-mail-composer';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import * as Browser from 'expo-web-browser';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
export function useCommunication() {
  const lifecycle = useScreenLifecycle(() => {});
  return useNativeTask([
    {
      id: 'availability',
      label: 'Inspect communication capabilities',
      run: async () => {
        const [email, sms] = await Promise.all([Mail.isAvailableAsync(), SMS.isAvailableAsync()]);
        return {
          platform: Platform.OS,
          emailComposerAvailable: email,
          smsComposerAvailable: sms,
          mailClients: Mail.getClients().map((client) => ({ label: client.label })),
          recipients: 'Chosen by the user inside the native composer.',
        };
      },
    },
    {
      id: 'email',
      label: 'Open email draft',
      run: async () => {
        lifecycle.assertActive();
        if (!(await Mail.isAvailableAsync()))
          throw new Error(
            'Email composition is unavailable. Use a physical iOS device with Mail configured, or an Android device with an email app.',
          );
        lifecycle.assertActive();
        const result = await Mail.composeAsync({
          recipients: [],
          subject: 'Angular Native showcase',
          body: 'This draft was opened from an Angular hook through the native email composer.',
          isHtml: false,
        });
        return {
          composerStatus: Platform.OS === 'android' ? 'not reported by Android' : result.status,
          deliveryVerified: false,
        };
      },
    },
    {
      id: 'sms',
      label: 'Open SMS draft',
      run: async () => {
        lifecycle.assertActive();
        if (!(await SMS.isAvailableAsync()))
          throw new Error(
            'SMS composition is unavailable on this device. The iOS simulator cannot compose SMS messages.',
          );
        lifecycle.assertActive();
        const result = await SMS.sendSMSAsync(
          [],
          'Angular Native opened this native message draft.',
        );
        return { composerStatus: result.result, deliveryVerified: false };
      },
    },
    {
      id: 'browser',
      label: 'Open Angular docs in-app',
      run: async () => {
        lifecycle.assertActive();
        return Browser.openBrowserAsync('https://angular.dev', { showTitle: true });
      },
    },
    {
      id: 'external-link',
      label: 'Open Angular docs externally',
      run: async () => {
        lifecycle.assertActive();
        if (!(await Linking.canOpenURL('https://angular.dev')))
          throw new Error('No app can open this HTTPS link.');
        lifecycle.assertActive();
        await Linking.openURL('https://angular.dev');
        return 'The system accepted the link. Return to the showcase to continue.';
      },
    },
  ]);
}
