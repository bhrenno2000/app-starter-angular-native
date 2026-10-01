import { inject } from '@angular/core';
import { NativeNavigation } from '@ng-native/router';
export function useNavigation() {
  const navigation = inject(NativeNavigation);
  return { back: () => navigation.back() };
}
