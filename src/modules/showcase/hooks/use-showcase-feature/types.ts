import type { useInteractions } from '../use-interactions';
import type { useNfc } from '../use-nfc';
import type { useBle } from '../use-ble';
import type { useLayoutMotion } from '../use-layout-motion';
import type { useMaps } from '../use-maps';
import type { useWebView } from '../use-web-view';
import type { useCamera } from '../use-camera';
import type { Signal } from '@angular/core';
import type { NativeTask } from '@/core/hooks/use-native-task/types';
export interface NativeFeature extends NativeTask {
  interaction?: ReturnType<typeof useInteractions>['interaction'];
  nfc?: ReturnType<typeof useNfc>['nfc'];
  ble?: ReturnType<typeof useBle>['ble'];
  layout?: ReturnType<typeof useLayoutMotion>['layout'];
  map?: ReturnType<typeof useMaps>['map'];
  web?: ReturnType<typeof useWebView>['web'];
  camera?: ReturnType<typeof useCamera>['camera'];
  videoId?: Signal<number | null>;
  preview?: Signal<string | null>;
  reading?: Signal<string | null>;
  coordinates?: Signal<string | null>;
}
