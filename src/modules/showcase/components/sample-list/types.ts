import type { useNativeList } from '../../hooks/use-native-list';
export type SampleListFacade = ReturnType<typeof useNativeList>['list'];
export type { SampleListItem } from '../../hooks/use-native-list/types';
