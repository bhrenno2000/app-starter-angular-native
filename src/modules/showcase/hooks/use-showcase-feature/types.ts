import type { useLayoutMotion } from '../use-layout-motion';
import type { useMaps } from '../use-maps';
import type { useWebView } from '../use-web-view';
import type { useCamera } from '../use-camera';
import type { Signal } from '@angular/core';
import type { NativeTask } from '@/core/hooks/use-native-task/types';
export interface NativeFeature extends NativeTask {
  layout?: ReturnType<typeof useLayoutMotion>['layout'];
  map?: ReturnType<typeof useMaps>['map'];
  web?: ReturnType<typeof useWebView>['web'];
  camera?: ReturnType<typeof useCamera>['camera'];
  videoId?: Signal<number | null>;
  preview?: Signal<string | null>;
  reading?: Signal<string | null>;
  coordinates?: Signal<string | null>;
}
