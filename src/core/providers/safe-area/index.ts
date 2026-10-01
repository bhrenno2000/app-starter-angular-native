import { Component } from '@angular/core';
import { SafeAreaProvider } from '@ng-native/components';
@Component({
  selector: 'app-safe-area-provider',
  imports: [SafeAreaProvider],
  templateUrl: './index.html',
  host: { class: 'flex-1' },
})
export class AppSafeAreaProvider {}
