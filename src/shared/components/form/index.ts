import { Component } from '@angular/core';
import { View } from '@ng-native/components';
@Component({
  selector: 'app-form',
  imports: [View],
  template: `<view class="gap-4"><ng-content /></view>`,
})
export class Form {}
