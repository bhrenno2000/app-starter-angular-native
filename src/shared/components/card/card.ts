import { Component } from '@angular/core';
import { View } from '@ng-native/components';
@Component({
  selector: 'app-card',
  imports: [View],
  template: `<view class="gap-3 rounded-xl border border-border bg-card p-4"><ng-content /></view>`,
})
export class Card {}
