import { Component } from '@angular/core';
import { GestureRoot } from '@ng-native/components/gestures';
@Component({
  selector: 'app-gesture-provider',
  imports: [GestureRoot],
  templateUrl: './index.html',
  host: { class: 'flex-1' },
})
export class AppGestureProvider {}
