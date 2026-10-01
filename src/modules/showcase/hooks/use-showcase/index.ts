import { inject, signal } from '@angular/core';
import { NativeNavigation } from '@ng-native/router';
import type { ShowcaseCategory } from './types';
const categories: readonly ShowcaseCategory[] = [
  {
    id: 'gallery',
    title: 'Photo library management',
    description: 'Paged asset queries, demo albums, image metadata and favorites.',
  },
  {
    id: 'screen-controls',
    title: 'Screen & lifecycle',
    description: 'Keep-awake, screenshot protection, app-switcher privacy and lifecycle state.',
  },
  {
    id: 'maps',
    title: 'Native maps',
    description: 'Apple Maps or Google Maps, markers, camera controls and location.',
  },
  {
    id: 'web-view',
    title: 'WebView',
    description: 'An embedded native browser with a validated message bridge to Angular.',
  },
  {
    id: 'camera',
    title: 'Camera & barcodes',
    description: 'A live camera preview, torch and native QR or barcode decoding.',
  },
  {
    id: 'video',
    title: 'Video playback',
    description: 'Native video rendering, playback, seeking and local video files.',
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Microphone recording and native audio playback.',
  },
  {
    id: 'connectivity',
    title: 'Connectivity',
    description: 'Network status, reachability and TanStack online state.',
  },
  {
    id: 'database',
    title: 'SQLite',
    description: 'Parameterized SQL and persistent native database records.',
  },
  {
    id: 'calendar',
    title: 'Calendar & reminders',
    description: 'Event queries, owned demo calendars/events, native editor and iOS reminders.',
  },
  {
    id: 'people',
    title: 'Contacts',
    description: 'Permission-aware contact queries and reversible demo-contact changes.',
  },
  {
    id: 'media',
    title: 'Camera & media',
    description: 'Capture photos and videos, pick media, resize, save and share.',
  },
  {
    id: 'files',
    title: 'Files & PDF',
    description: 'Native document picker, local files and PDF generation.',
  },
  {
    id: 'security',
    title: 'Biometrics & security',
    description: 'Face ID, fingerprint authentication, device-only secrets and crypto.',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Local notifications, receive/open events, push registration and badges.',
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Current GPS position and live foreground tracking.',
  },
  {
    id: 'sensors',
    title: 'Motion & sensors',
    description: 'Live accelerometer, gyroscope, magnetometer and step counting.',
  },
  {
    id: 'device',
    title: 'Device & system',
    description: 'Hardware, battery, haptics, clipboard, speech and orientation.',
  },
  {
    id: 'query',
    title: 'TanStack Query',
    description: 'Real HTTP requests, typed cache, refetching and mutations.',
  },
  {
    id: 'state',
    title: 'Zustand & MMKV',
    description: 'A vanilla store bound to Angular signals and encrypted native persistence.',
  },
];
export function useShowcase() {
  const navigation = inject(NativeNavigation);
  const error = signal<string | null>(null);
  return {
    categories,
    error: error.asReadonly(),
    open: async (id: string) => {
      error.set(null);
      try {
        if (!(await navigation.push(`/showcase/${id}`)))
          error.set('Unable to open this demonstration.');
      } catch (cause) {
        error.set(cause instanceof Error ? cause.message : 'Unable to open this demonstration.');
      }
    },
    back: () => navigation.back(),
  };
}

export function findShowcaseCategory(id: string | null) {
  return categories.find((category) => category.id === id);
}
