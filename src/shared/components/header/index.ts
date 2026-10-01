import { Component, input } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { useNavigation } from '@/core/hooks/use-navigation';
import { Icon } from '../icon/index';
@Component({
  selector: 'app-header',
  imports: [Pressable, Text, View, Icon],
  templateUrl: './index.html',
})
export class Header {
  protected readonly navigation = useNavigation();
  readonly title = input('');
  readonly showBack = input(false);
}
