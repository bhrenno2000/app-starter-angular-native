import { Component, input } from '@angular/core';
@Component({
  selector: 'app-native-video',
  templateUrl: './index.html',
  styles: ':host { height: 256px; width: 100%; }',
  host: {
    '[player]': 'playerId()',
    '[nativeControls]': 'true',
    '[contentFit]': "'contain'",
  },
})
export class NativeVideo {
  readonly playerId = input.required<number>();
}
