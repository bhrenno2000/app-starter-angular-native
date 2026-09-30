import type { IconName } from './types';
import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-native/icons';
import { provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideChevronLeft } from '@ng-icons/lucide';
@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  providers: [provideIcons({ lucideLogOut, lucideChevronLeft })],
  templateUrl: './index.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
