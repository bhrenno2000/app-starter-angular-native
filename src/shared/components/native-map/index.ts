import { Component, input, output } from '@angular/core';
import type { MapCamera, MapMarker } from './types';
@Component({
  selector: 'app-native-map',
  templateUrl: './index.html',
  styles: ':host { height: 360px; width: 100%; }',
  host: { '[cameraPosition]': 'camera()', '[markers]': 'markers()' },
})
export class NativeMap {
  readonly camera = input.required<MapCamera>();
  readonly markers = input.required<readonly MapMarker[]>();
  readonly mapClick = output<unknown>();
  readonly markerClick = output<unknown>();
  readonly cameraMove = output<unknown>();
}
