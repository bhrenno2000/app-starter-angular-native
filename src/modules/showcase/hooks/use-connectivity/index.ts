import { DestroyRef, inject, signal } from '@angular/core';
import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useConnectivity() {
  const reading = signal<string | null>(null);
  const unsubscribe = NetInfo.addEventListener((state) => {
    reading.set(
      JSON.stringify(
        {
          type: state.type,
          connected: state.isConnected,
          internetReachable: state.isInternetReachable,
        },
        null,
        2,
      ),
    );
  });
  inject(DestroyRef).onDestroy(() => {
    unsubscribe();
  });
  return {
    reading: reading.asReadonly(),
    ...useNativeTask([
      { id: 'refresh', label: 'Refresh connectivity state', run: () => NetInfo.fetch() },
      { id: 'ip', label: 'Read device IP address', run: () => Network.getIpAddressAsync() },
      {
        id: 'network',
        label: 'Inspect network connection',
        run: () => Network.getNetworkStateAsync(),
      },
    ]),
  };
}
