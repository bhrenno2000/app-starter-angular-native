import { Component } from '@angular/core';
import { KeyboardAvoidingView, SafeAreaView, ScrollView, View } from '@ng-native/components';
@Component({
  selector: 'app-form-screen-layout',
  imports: [KeyboardAvoidingView, SafeAreaView, ScrollView, View],
  template: `<safe-area-view class="flex-1 bg-background"
    ><keyboard-avoiding-view class="flex-1" behavior="padding"
      ><scroll-view class="flex-1" keyboardShouldPersistTaps="handled"
        ><view class="gap-6 px-4 pt-8 pb-6"><ng-content /></view></scroll-view
      ><view class="gap-3 px-4 pb-4"><ng-content select="[footer]" /></view></keyboard-avoiding-view
  ></safe-area-view>`,
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class FormScreenLayout {}
