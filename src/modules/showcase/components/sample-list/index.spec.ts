import { signal } from '@angular/core';
import { cleanup, fireEvent, render, screen, userEvent, waitFor } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { SampleList } from './index';
import type { SampleListItem } from './types';
afterEach(cleanup);

test('windows a long list and rebinds recycled rows without leaking item selection', async () => {
  const selectedId = signal<number | null>(null);
  const items = signal<readonly SampleListItem[]>(
    Array.from({ length: 200 }, (_, index) => ({
      id: index + 1,
      title: `Sample item ${index + 1}`,
      favorite: index === 99,
    })),
  );
  await render(SampleList, {
    inputs: {
      list: {
        items,
        selectedId,
        favoritesOnly: signal(false),
        canLoadMore: signal(false),
        summary: signal('200 local sample items'),
        loadMore: vi.fn(),
        select: (id: number) => selectedId.set(id),
      },
    },
  });
  const list = screen.getByTestId('sample-list');
  await fireEvent(list, 'layout', { layout: { x: 0, y: 0, width: 320, height: 256 } });
  expect(screen.getAllByRole('button').length).toBeLessThan(200);
  await userEvent.setup().press(screen.getByRole('button', { name: 'Select Sample item 1' }));
  expect(selectedId()).toBe(1);
  await fireEvent.scroll(list, {
    contentOffset: { x: 0, y: 99 * 64 },
    layoutMeasurement: { width: 320, height: 256 },
    contentSize: { width: 320, height: 200 * 64 },
  });
  expect(screen.queryByRole('button', { name: 'Select Sample item 1' })).toBeNull();
  const target = screen.getByRole('button', { name: 'Select Sample item 100' });
  expect(target.props['accessibilityState']).toMatchObject({ selected: false });
  expect(screen.getByText('Sample item 100 · Favorite')).toBeTruthy();
  await userEvent.setup().press(target);
  expect(selectedId()).toBe(100);
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Select Sample item 100' }).props['accessibilityState'],
    ).toMatchObject({ selected: true }),
  );
});
