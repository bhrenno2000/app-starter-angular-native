import { useVideo } from '../use-video';
import { useAudio } from '../use-audio';
import { useConnectivity } from '../use-connectivity';
import { useDatabase } from '../use-database';
import { usePeople } from '../use-people';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeNavigation } from '@ng-native/router';
import { useMedia } from '../use-media';
import { useFiles } from '../use-files';
import { useSecurity } from '../use-security';
import { useDevice } from '../use-device';
import { useNotifications } from '../use-notifications';
import { useLocation } from '../use-location';
import { useSensors } from '../use-sensors';
import { useQueryDemo } from '../use-query';
import { useShowcaseState } from '../use-showcase-state';
import type { ShowcaseCategory } from './types';
const categories: readonly ShowcaseCategory[] = [
  {
    id: 'video',
    title: 'Video playback',
    description: 'Native video rendering, playback, seeking and local video files.',
    create: useVideo,
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Microphone recording and native audio playback.',
    create: useAudio,
  },
  {
    id: 'connectivity',
    title: 'Connectivity',
    description: 'Network status, reachability and TanStack online state.',
    create: useConnectivity,
  },
  {
    id: 'database',
    title: 'SQLite',
    description: 'Parameterized SQL and persistent native database records.',
    create: useDatabase,
  },
  {
    id: 'people',
    title: 'Contacts & calendar',
    description: 'Permission-aware contacts and native event editing.',
    create: usePeople,
  },
  {
    id: 'media',
    title: 'Camera & media',
    description: 'Capture photos and videos, pick media, resize, save and share.',
    create: useMedia,
  },
  {
    id: 'files',
    title: 'Files & PDF',
    description: 'Native document picker, local files and PDF generation.',
    create: useFiles,
  },
  {
    id: 'security',
    title: 'Biometrics & security',
    description: 'Face ID, fingerprint authentication, device-only secrets and crypto.',
    create: useSecurity,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Local notifications, receive/open events, push registration and badges.',
    create: useNotifications,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Current GPS position and live foreground tracking.',
    create: useLocation,
  },
  {
    id: 'sensors',
    title: 'Motion & sensors',
    description: 'Live accelerometer, gyroscope, magnetometer and step counting.',
    create: useSensors,
  },
  {
    id: 'device',
    title: 'Device & system',
    description: 'Hardware, battery, haptics, clipboard, speech and orientation.',
    create: useDevice,
  },
  {
    id: 'query',
    title: 'TanStack Query',
    description: 'Real HTTP requests, typed cache, refetching and mutations.',
    create: useQueryDemo,
  },
  {
    id: 'state',
    title: 'Zustand & MMKV',
    description: 'A vanilla store bound to Angular signals and encrypted native persistence.',
    create: useShowcaseState,
  },
];
export function useShowcase() {
  const navigation = inject(NativeNavigation);
  return {
    categories,
    open: (id: string) => navigation.push(`/showcase/${id}`),
    back: () => navigation.back(),
  };
}
export function useShowcaseFeature() {
  const route = inject(ActivatedRoute);
  const navigation = inject(NativeNavigation);
  const id = route.snapshot.paramMap.get('category');
  const category = categories.find((entry) => entry.id === id);
  if (!category) throw new Error('Unknown showcase category.');
  return { category, demo: category.create(), back: () => navigation.back() };
}
