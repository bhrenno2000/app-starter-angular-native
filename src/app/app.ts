import { AppGestureProvider } from '@/core/providers/gestures';
import { Component } from '@angular/core';
import { AppSafeAreaProvider } from '@/core/providers/safe-area';
import { NativeStackOutlet } from '@ng-native/router';
@Component({
  selector: 'app-root',
  imports: [AppSafeAreaProvider, AppGestureProvider, NativeStackOutlet],
  templateUrl: './app.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class App {}
