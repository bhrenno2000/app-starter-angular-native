import { Component, computed, input } from '@angular/core';
import { Text } from '@ng-native/components';
@Component({
  selector: 'app-typography',
  imports: [Text],
  template: `<text [class]="classes()"><ng-content /></text>`,
})
export class Typography {
  readonly variant = input<'body' | 'title' | 'heading' | 'muted'>('body');
  protected readonly classes = computed(
    () =>
      ({
        body: 'text-base font-normal text-foreground',
        title: 'text-3xl font-semibold text-foreground',
        heading: 'text-2xl font-semibold text-foreground',
        muted: 'text-sm font-normal text-muted',
      })[this.variant()],
  );
}
