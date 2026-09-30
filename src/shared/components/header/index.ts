import { Component, inject, input } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Icon } from '../icon/index';
@Component({
  selector: 'app-header',
  imports: [Pressable, Text, View, Icon],
  templateUrl: './index.html',
})
export class Header {
  protected readonly navigation = inject(NativeNavigation);
  readonly title = input('');
  readonly showBack = input(false);
}
