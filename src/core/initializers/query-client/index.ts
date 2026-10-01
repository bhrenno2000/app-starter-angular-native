import { DestroyRef, inject, provideAppInitializer } from '@angular/core';
import { focusManager, onlineManager } from '@tanstack/angular-query-experimental';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
export function provideQueryClientInitializer() {
  return provideAppInitializer(() => {
    const destroy = inject(DestroyRef);
    const unsubscribe = NetInfo.addEventListener((state) => {
      onlineManager.setOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    focusManager.setFocused(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    destroy.onDestroy(() => {
      unsubscribe();
      subscription.remove();
    });
  });
}
