import type { IconName } from './types';
import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-native/icons';
@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  templateUrl: './index.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
