import { expect, test } from 'vitest';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { createShowcaseStore } from './index';
test('restores Zustand state from the storage adapter without persisting actions', () => {
  const storage = new MemoryStorage();
  const first = createShowcaseStore(storage);
  first.getState().increment();
  first.getState().toggleFavorite('media');
  const payload = storage.get('showcase.state');
  expect(payload).not.toContain('increment');
  const second = createShowcaseStore(storage);
  expect(second.getState().counter).toBe(1);
  expect(second.getState().favorites).toEqual(['media']);
  second.getState().increment();
  expect(second.getState().counter).toBe(2);
});
test('reset preserves unrelated auth and theme storage', () => {
  const storage = new MemoryStorage();
  storage.set('store.theme', 'dark');
  storage.secrets.set('auth.refreshToken', 'refresh');
  const store = createShowcaseStore(storage);
  store.getState().increment();
  store.getState().reset();
  expect(store.getState().counter).toBe(0);
  expect(storage.get('store.theme')).toBe('dark');
  expect(storage.secrets.get('auth.refreshToken')).toBe('refresh');
});
