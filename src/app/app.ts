import { Component, inject } from '@angular/core';
import { SafeAreaProvider } from '@ng-native/components';
import { NativeStackOutlet } from '@ng-native/router';
import { ThemePreference } from '@/core/theme/theme-preference';
@Component({
  selector: 'app-root',
  imports: [SafeAreaProvider, NativeStackOutlet],
  template: `<safe-area-provider class="flex-1"><native-stack-outlet /></safe-area-provider>`,
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class App {
  private readonly theme = inject(ThemePreference);
  constructor() {
    this.theme.mode();
  }
}
