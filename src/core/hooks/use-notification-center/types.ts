export type { Notification } from 'expo-notifications';
export interface NotificationSummary {
  id: string;
  title: string | null;
  body: string | null;
  date: number;
}
