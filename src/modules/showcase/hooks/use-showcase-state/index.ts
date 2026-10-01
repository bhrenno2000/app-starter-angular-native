import { DestroyRef, InjectionToken, inject, signal } from '@angular/core';
import { createStore } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import { APP_STORAGE } from '@/core/storage/app-storage';
import type { AppStorage } from '@/core/storage/app-storage/types';
import { useNativeTask } from '@/core/hooks/use-native-task';
import type { ShowcaseState } from './types';
export function createShowcaseStore(storage: AppStorage) {
  return createStore<ShowcaseState>()(
    persist(
      (set) => ({
        counter: 0,
        favorites: [],
        increment: () => set((state) => ({ counter: state.counter + 1 })),
        reset: () => set({ counter: 0, favorites: [] }),
        toggleFavorite: (id) =>
          set((state) => ({
            favorites: state.favorites.includes(id)
              ? state.favorites.filter((entry) => entry !== id)
              : [...state.favorites, id],
          })),
      }),
      {
        name: 'showcase.state',
        storage: createJSONStorage(() => ({
          getItem: (key) => storage.get(key),
          setItem: (key, value) => storage.set(key, value),
          removeItem: (key) => storage.remove(key),
        })),
        partialize: (state) => ({ counter: state.counter, favorites: state.favorites }),
      },
    ),
  );
}
const STORE = new InjectionToken('showcase-store', {
  providedIn: 'root',
  factory: () => createShowcaseStore(inject(APP_STORAGE)),
});
export function useShowcaseState() {
  const store = inject(STORE);
  const state = signal(store.getState());
  inject(DestroyRef).onDestroy(store.subscribe((value) => state.set(value)));
  return {
    state: state.asReadonly(),
    toggleFavorite: (id: string) => store.getState().toggleFavorite(id),
    ...useNativeTask([
      {
        id: 'increment',
        label: 'Increment persisted counter',
        run: () => {
          store.getState().increment();
          return {
            counter: store.getState().counter,
            storage: 'Encrypted MMKV',
            state: 'Zustand vanilla',
          };
        },
      },
      {
        id: 'read',
        label: 'Read persisted state',
        run: () => ({ counter: store.getState().counter, favorites: store.getState().favorites }),
      },
      {
        id: 'reset',
        label: 'Reset showcase state',
        run: () => {
          store.getState().reset();
          return 'Showcase state reset. Login and theme data were preserved.';
        },
      },
    ]),
  };
}
