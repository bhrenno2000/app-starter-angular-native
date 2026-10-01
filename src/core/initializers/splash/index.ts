import { afterNextRender } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import * as SplashScreen from 'expo-splash-screen';
import type { MountResult } from './types';
export function prepareSplash() {
  void SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
    console.error('Unable to retain the startup splash', error);
  });
}
export function initializeSplash(app: MountResult) {
  const injector = app.applicationRef.injector;
  const router = injector.get(Router);
  const hide = () => {
    afterNextRender(
      () => {
        void SplashScreen.hideAsync().catch((error: unknown) => {
          console.error('Unable to hide the startup splash', error);
        });
      },
      { injector },
    );
  };
  if (router.navigated) {
    hide();
    return;
  }
  const subscription = router.events.subscribe((event) => {
    if (!(event instanceof NavigationEnd)) return;
    subscription.unsubscribe();
    hide();
  });
  app.componentRef.onDestroy(() => subscription.unsubscribe());
}
