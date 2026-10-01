import { Component, input } from '@angular/core';
import { VirtualList, VirtualListRow, View, Text, Pressable } from '@ng-native/components';
import type { SampleListFacade, SampleListItem } from './types';
@Component({
  selector: 'app-sample-list',
  imports: [VirtualList, VirtualListRow, View, Text, Pressable],
  templateUrl: './index.html',
})
export class SampleList {
  readonly list = input.required<SampleListFacade>();
  protected readonly itemKey = (item: SampleListItem) => item.id;
}
