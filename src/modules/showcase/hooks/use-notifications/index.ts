import Constants from 'expo-constants';
import { NOTIFICATION_CENTER } from '@/core/providers/notifications';
import { inject } from '@angular/core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useNotifications() {
  const center = inject(NOTIFICATION_CENTER);
  const permit = async () => {
    if (Platform.OS === 'android')
      await Notifications.setNotificationChannelAsync('showcase', {
        name: 'Showcase',
        importance: Notifications.AndroidImportance.HIGH,
      });
    if (!(await Notifications.requestPermissionsAsync()).granted)
      throw new Error('Notification permission was denied.');
  };
  return {
    reading: center.reading,
    ...useNativeTask([
      {
        id: 'permission',
        label: 'Request notification permission',
        run: () => Notifications.requestPermissionsAsync(),
      },
      {
        id: 'schedule',
        label: 'Schedule a notification in 5 seconds',
        run: async () => {
          await permit();
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Angular Native',
              body: 'This notification was scheduled through a hook.',
              sound: true,
              data: { showcase: true },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 5,
              channelId: 'showcase',
            },
          });
          return { scheduledId: id };
        },
      },
      {
        id: 'pending',
        label: 'List scheduled notifications',
        run: () => Notifications.getAllScheduledNotificationsAsync(),
      },
      {
        id: 'cancel',
        label: 'Cancel this demo notifications',
        run: async () => {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          for (const item of scheduled) {
            if (item.content.data?.showcase === true)
              await Notifications.cancelScheduledNotificationAsync(item.identifier);
          }
          return 'Demo notifications cancelled.';
        },
      },
      {
        id: 'badge',
        label: 'Set application badge to 1',
        run: () => Notifications.setBadgeCountAsync(1),
      },
      {
        id: 'clear-badge',
        label: 'Clear application badge',
        run: () => Notifications.setBadgeCountAsync(0),
      },
      {
        id: 'received',
        label: 'Inspect received and opened notifications',
        run: () => JSON.parse(center.reading()),
      },
      {
        id: 'clear-history',
        label: 'Clear notification event history',
        run: () => {
          center.clear();
          return 'Event history cleared.';
        },
      },
      {
        id: 'delivered',
        label: 'List delivered notifications',
        run: () => Notifications.getPresentedNotificationsAsync(),
      },
      {
        id: 'dismiss',
        label: 'Dismiss delivered demo notifications',
        run: async () => {
          const delivered = await Notifications.getPresentedNotificationsAsync();
          for (const item of delivered) {
            if (item.request.content.data?.showcase === true)
              await Notifications.dismissNotificationAsync(item.request.identifier);
          }
          return 'Delivered demo notifications dismissed.';
        },
      },
      {
        id: 'push',
        label: 'Register Expo push token',
        run: async () => {
          const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
          if (typeof projectId !== 'string' || !projectId)
            throw new Error(
              'Configure EXPO_PUBLIC_EAS_PROJECT_ID and native push credentials before registering for remote push.',
            );
          await permit();
          return { expoPushToken: (await Notifications.getExpoPushTokenAsync({ projectId })).data };
        },
      },
    ]),
  };
}
