import { Component } from '@angular/core';
import { View } from '@ng-native/components';
@Component({
  selector: 'app-skeleton',
  imports: [View],
  template: `<view class="h-4 rounded bg-border" [accessibilityElementsHidden]="true" />`,
})
export class Skeleton {}
