import { useInteractions } from '../use-interactions';
import { useBackgroundLocation } from '@/core/hooks/use-background-location';
import { useBackgroundTask } from '@/core/hooks/use-background-task';
import { useNfc } from '../use-nfc';
import { useBle } from '../use-ble';
import { useLayoutMotion } from '../use-layout-motion';
import { useCommunication } from '../use-communication';
import { useCalendar } from '../use-calendar';
import { useGallery } from '../use-gallery';
import { useScreenControls } from '../use-screen-controls';
import { useMaps } from '../use-maps';
import { useWebView } from '../use-web-view';
import { useCamera } from '../use-camera';
import { useVideo } from '../use-video';
import { useAudio } from '../use-audio';
import { useConnectivity } from '../use-connectivity';
import { useDatabase } from '../use-database';
import { usePeople } from '../use-people';
import { useMedia } from '../use-media';
import { useFiles } from '../use-files';
import { useSecurity } from '../use-security';
import { useDevice } from '../use-device';
import { useNotifications } from '../use-notifications';
import { useLocation } from '../use-location';
import { useSensors } from '../use-sensors';
import { useQueryDemo } from '../use-query';
import { useShowcaseState } from '../use-showcase-state';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeNavigation } from '@ng-native/router';
import { findShowcaseCategory } from '../use-showcase';
import type { NativeFeature } from './types';
const factories: Readonly<Record<string, () => NativeFeature>> = {
  interactions: useInteractions,
  'layout-motion': useLayoutMotion,
  bluetooth: useBle,
  nfc: useNfc,
  background: useBackgroundTask,
  'background-location': useBackgroundLocation,
  gallery: useGallery,
  calendar: useCalendar,
  communication: useCommunication,
  'screen-controls': useScreenControls,
  maps: useMaps,
  'web-view': useWebView,
  camera: useCamera,
  video: useVideo,
  audio: useAudio,
  connectivity: useConnectivity,
  database: useDatabase,
  people: usePeople,
  media: useMedia,
  files: useFiles,
  security: useSecurity,
  notifications: useNotifications,
  location: useLocation,
  sensors: useSensors,
  device: useDevice,
  query: useQueryDemo,
  state: useShowcaseState,
};
export function useShowcaseFeature() {
  const route = inject(ActivatedRoute);
  const navigation = inject(NativeNavigation);
  const id = route.snapshot.paramMap.get('category');
  const category = findShowcaseCategory(id);
  const create = id ? factories[id] : null;
  if (!category || !create) throw new Error('Unknown showcase category.');
  return { category, demo: create(), back: () => navigation.back() };
}
