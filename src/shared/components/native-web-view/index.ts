import { Component, input, output } from '@angular/core';
import type { WebDocument } from './types';
@Component({
  selector: 'app-native-web-view',
  templateUrl: './index.html',
  styles: ':host { height: 360px; width: 100%; }',
  host: {
    '[newSource]': 'document()',
    '[javaScriptEnabled]': 'true',
    '[messagingEnabled]': 'true',
    '[messagingModuleName]': "''",
    '[domStorageEnabled]': 'true',
  },
})
export class NativeWebView {
  readonly document = input.required<WebDocument>();
  readonly shouldStartLoadWithRequest = output<unknown>();
  readonly message = output<unknown>();
  readonly loadingFinish = output<unknown>();
  readonly loadingError = output<unknown>();
}
