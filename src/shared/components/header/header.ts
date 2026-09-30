import { Component, inject, input } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Icon } from '../icon/icon';
@Component({
  selector: 'app-header',
  imports: [Pressable, Text, View, Icon],
  template: `<view class="min-h-12 flex-row items-center gap-3">
    @if (showBack()) {
      <pressable
        class="min-h-12 min-w-12 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        (press)="navigation.back()"
        ><app-icon name="lucideChevronLeft"
      /></pressable>
    }
    <text class="text-lg font-semibold text-foreground">{{ title() }}</text></view
  >`,
})
export class Header {
  protected readonly navigation = inject(NativeNavigation);
  readonly title = input('');
  readonly showBack = input(false);
}
