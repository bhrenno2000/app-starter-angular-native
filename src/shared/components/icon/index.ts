import type { IconName } from './types';
import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-native/icons';
import { provideAppIcons } from '@/core/providers/icons';
@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  providers: [provideAppIcons()],
  templateUrl: './index.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
