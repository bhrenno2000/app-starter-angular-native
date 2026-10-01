import { DestroyRef, inject } from '@angular/core';
import * as Linking from 'expo-linking';
import { parseAppLink } from '@/modules/showcase/utils/app-link';
import type { DeepLinkSource } from './types';
export function useAppLinks(): DeepLinkSource {
  const destroy = inject(DestroyRef);
  const subscriptions = new Set<() => void>();
  let disposed = false;
  destroy.onDestroy(() => {
    disposed = true;
    for (const remove of subscriptions) remove();
    subscriptions.clear();
  });
  return {
    launchUrl: async () => {
      try {
        const target = parseAppLink(await Linking.getInitialURL());
        return disposed ? null : target;
      } catch {
        return null;
      }
    },
    subscribe: (listener) => {
      if (disposed) return () => {};
      const subscription = Linking.addEventListener('url', ({ url }) => {
        const target = parseAppLink(url);
        if (target && !disposed) listener(target);
      });
      const remove = () => {
        if (!subscriptions.delete(remove)) return;
        subscription.remove();
      };
      subscriptions.add(remove);
      return remove;
    },
    open: (url) => {
      const target = parseAppLink(url);
      if (target && !disposed)
        void Linking.openURL(`appstarterangular://${target.slice(1)}`).catch(() => {});
    },
  };
}
