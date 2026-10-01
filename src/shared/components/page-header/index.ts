import { Component, input, output } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { Icon } from '../icon';
@Component({
  selector: 'app-page-header',
  imports: [Pressable, Text, View, Icon],
  templateUrl: './index.html',
  styles: ':host { flex-shrink: 0; }',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly canGoBack = input(true);
  readonly back = output<void>();
}
