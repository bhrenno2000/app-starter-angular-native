import { inject, provideAppInitializer } from '@angular/core';
import { ThemePreference } from '@/core/theme/theme-preference';
export function provideThemeInitializer() {
  return provideAppInitializer(() => {
    inject(ThemePreference).mode();
  });
}
