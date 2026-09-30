import { Component, input, model, output } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import { Text, TextInput, View } from '@ng-native/components';
import type { KeyboardType } from '@ng-native/components';
@Component({
  selector: 'app-input',
  imports: [Text, TextInput, View],
  template: `<view class="gap-2"
    ><text class="text-base font-medium text-foreground">{{ label() }}</text
    ><text-input
      class="min-h-12 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
      [class.border-danger]="invalid() && touched()"
      [accessibilityLabel]="label()"
      [value]="value()"
      (changeText)="value.set($event)"
      (blur)="touch.emit()"
      [editable]="!disabled() && !readonly()"
      [secureTextEntry]="password()"
      [keyboardType]="keyboardType()"
      autoCapitalize="none"
      [placeholder]="placeholder()"
      placeholderTextColor="#737373"
    />
    @if (invalid() && touched()) {
      <text accessibilityRole="alert" class="text-sm text-danger">{{
        errors()[0]?.message ?? 'Verifique este campo.'
      }}</text>
    }
  </view>`,
})
export class Input {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly password = input(false);
  readonly keyboardType = input<KeyboardType>('default');
  readonly value = model('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly errors = input<readonly ValidationError[]>([]);
  readonly touch = output<void>();
}
