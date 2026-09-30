import { Component, input, model, output } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import { Text, TextInput, View } from '@ng-native/components';
import type { KeyboardType } from '@ng-native/components';
@Component({
  selector: 'app-input',
  imports: [Text, TextInput, View],
  templateUrl: './index.html',
})
export class Input {
  readonly testId = input<string>();
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
