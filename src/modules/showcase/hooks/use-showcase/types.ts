import type { Signal } from '@angular/core';
import type { NativeTask } from '@/core/hooks/use-native-task/types';
export interface NativeFeature extends NativeTask {
  videoId?: Signal<number | null>;
  preview?: Signal<string | null>;
  reading?: Signal<string | null>;
  coordinates?: Signal<string | null>;
}
export interface ShowcaseCategory {
  id: string;
  title: string;
  description: string;
  create: () => NativeFeature;
}
