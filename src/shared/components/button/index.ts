import type { ButtonVariant, IconName } from './types';
import { Component, computed, input, output } from '@angular/core';
import { ActivityIndicator, Pressable, Text } from '@ng-native/components';
import { Icon } from '../icon/index';
@Component({
  selector: 'app-button',
  imports: [ActivityIndicator, Pressable, Text, Icon],
  templateUrl: './index.html',
  styles: `
    :host {
      flex-shrink: 1;
    }
    pressable:active {
      opacity: 0.8;
    }
  `,
})
export class Button {
  readonly icon = input<IconName>();
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('solid');
  readonly danger = input(false);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly pressed = output<void>();
  protected readonly classes = computed(
    () =>
      'min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ' +
      (this.variant() === 'solid' ? 'bg-accent' : 'border border-border') +
      (this.disabled() || this.loading() ? ' opacity-50' : ''),
  );
  protected readonly labelClasses = computed(
    () =>
      'font-semibold text-base ' +
      (this.danger()
        ? 'text-danger'
        : this.variant() === 'solid'
          ? 'text-accent-foreground'
          : 'text-foreground'),
  );
}
