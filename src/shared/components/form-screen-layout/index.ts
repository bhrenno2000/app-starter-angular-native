import { Component } from '@angular/core';
import { KeyboardAvoidingView, SafeAreaView, ScrollView, View } from '@ng-native/components';
@Component({
  selector: 'app-form-screen-layout',
  imports: [KeyboardAvoidingView, SafeAreaView, ScrollView, View],
  templateUrl: './index.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class FormScreenLayout {}
