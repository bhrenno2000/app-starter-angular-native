import { computed, signal } from '@angular/core';
import { useNativeTask } from '@/core/hooks/use-native-task';
import type { SampleListItem } from './types';
export function useNativeList() {
  const loaded = signal(20);
  const selectedId = signal<number | null>(null);
  const favorites = signal<readonly number[]>([]);
  const favoritesOnly = signal(false);
  const items = computed<readonly SampleListItem[]>(() =>
    Array.from({ length: loaded() }, (_, index) => ({
      id: index + 1,
      title: `Sample item ${index + 1}`,
      favorite: favorites().includes(index + 1),
    })).filter((item) => !favoritesOnly() || item.favorite),
  );
  const loadMore = () => loaded.update((count) => Math.min(200, count + 20));
  const refresh = () => {
    loaded.set(20);
    selectedId.set(null);
  };
  return {
    list: {
      items,
      selectedId: selectedId.asReadonly(),
      favoritesOnly: favoritesOnly.asReadonly(),
      canLoadMore: computed(() => loaded() < 200),
      summary: computed(
        () => `Loaded ${loaded()} of 200 local samples · ${favorites().length} favorites`,
      ),
      loadMore,
      select: (id: number) => {
        if (items().some((item) => item.id === id)) selectedId.set(id);
      },
    },
    ...useNativeTask([
      {
        id: 'more',
        label: 'Load 20 more sample items',
        run: () => {
          loadMore();
          return `Loaded ${loaded()} local sample items.`;
        },
      },
      {
        id: 'refresh',
        label: 'Reload local sample list',
        run: () => {
          refresh();
          return 'Local sample list reloaded. Favorites were preserved.';
        },
      },
      {
        id: 'favorite',
        label: 'Toggle selected item favorite',
        run: () => {
          const id = selectedId();
          if (id === null) throw new Error('Select a list item first.');
          favorites.update((ids) =>
            ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
          );
          if (!items().some((item) => item.id === id)) selectedId.set(null);
          return { itemId: id, favorite: favorites().includes(id) };
        },
      },
      {
        id: 'filter',
        label: 'Toggle favorite items filter',
        run: () => {
          favoritesOnly.update((value) => !value);
          if (!items().some((item) => item.id === selectedId())) selectedId.set(null);
          return { favoritesOnly: favoritesOnly() };
        },
      },
    ]),
  };
}
