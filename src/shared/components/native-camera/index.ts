import type { CameraFacing } from '@/shared/components/native-camera/types';
import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-native-camera',
  templateUrl: './index.html',
  styles: ':host { height: 360px; width: 100%; }',
  host: {
    '[facing]': 'facing()',
    '[mode]': "'picture'",
    '[active]': 'true',
    '[barcodeScannerEnabled]': 'true',
    '[barcodeScannerSettings]': 'settings',
    '[enableTorch]': 'torch()',
  },
})
export class NativeCamera {
  readonly facing = input<CameraFacing>('back');
  readonly torch = input(false);
  readonly settings = { barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'pdf417'] };
  readonly barcodeScanned = output<unknown>();
  readonly cameraReady = output<unknown>();
  readonly mountError = output<unknown>();
}
