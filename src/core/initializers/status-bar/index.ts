import { provideAppInitializer } from '@angular/core';
import { useStatusBar } from '@/core/hooks/use-status-bar';
export function provideStatusBarInitializer() {
  return provideAppInitializer(() => useStatusBar());
}
