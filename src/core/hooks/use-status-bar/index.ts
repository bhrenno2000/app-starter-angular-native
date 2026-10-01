import { effect, inject } from '@angular/core';
import { ColorScheme, StatusBar } from '@ng-native/device';
export function useStatusBar() {
  const appearance = inject(ColorScheme);
  const bar = inject(StatusBar);
  effect(() => {
    bar.set({ style: appearance.current() === 'dark' ? 'light' : 'dark', animated: false });
  });
}
