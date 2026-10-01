import { PageHeader } from '../page-header';
import { Component, input, output } from '@angular/core';
import { KeyboardAvoidingView, SafeAreaView, ScrollView, View } from '@ng-native/components';
@Component({
  selector: 'app-form-screen-layout',
  imports: [PageHeader, KeyboardAvoidingView, SafeAreaView, ScrollView, View],
  templateUrl: './index.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class FormScreenLayout {
  readonly title = input.required<string>();
  readonly back = output<void>();
}
