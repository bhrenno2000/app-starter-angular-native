import { DestroyRef, effect, inject, untracked } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
export function useScreenLifecycle(stop: () => void) {
  const screen = inject(SCREEN_IN_FRONT);
  const app = inject(AppState);
  let disposed = false;
  let generation = 0;
  const active = () => !disposed && screen() && app.active();
  const suspend = () => {
    generation++;
    stop();
  };
  effect(() => {
    if (!screen() || !app.active()) untracked(suspend);
  });
  inject(DestroyRef).onDestroy(() => {
    disposed = true;
    suspend();
  });
  return {
    isActive: active,
    checkpoint() {
      const current = generation;
      return () => active() && generation === current;
    },
    assertActive() {
      if (!active()) throw new Error('This screen is no longer active.');
    },
  };
}
