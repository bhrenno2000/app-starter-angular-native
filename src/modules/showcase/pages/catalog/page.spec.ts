import { provideAppIcons } from '@/core/providers/icons';
import { cleanup, render, screen, userEvent } from '@ng-native/testing';
import { NativeNavigation } from '@ng-native/router';
import { afterEach, expect, test, vi } from 'vitest';
import { ShowcaseCatalogPage } from './page';
afterEach(cleanup);
test('renders the catalogue without native SDKs and routes an accessible feature action', async () => {
  const push = vi.fn(async () => true);
  await render(ShowcaseCatalogPage, {
    providers: [
      provideAppIcons(),
      { provide: NativeNavigation, useValue: { push, back: vi.fn() } },
    ],
  });
  expect(screen.getByText('Native showcase')).toBeTruthy();
  expect(screen.getByText('Camera & barcodes')).toBeTruthy();
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Explore WebView' }));
  expect(push).toHaveBeenCalledExactlyOnceWith('/showcase/web-view');
});

test('shows a navigation failure without leaving the catalogue', async () => {
  await render(ShowcaseCatalogPage, {
    providers: [
      provideAppIcons(),
      {
        provide: NativeNavigation,
        useValue: {
          push: vi.fn(async () => {
            throw new Error('This demonstration could not start.');
          }),
          back: vi.fn(),
        },
      },
    ],
  });
  await userEvent.setup().press(screen.getByRole('button', { name: 'Explore WebView' }));
  expect(await screen.findByText('This demonstration could not start.')).toBeTruthy();
  expect(screen.getByText('Native showcase')).toBeTruthy();
});

test('filters case-insensitively across category descriptions and clears an empty result', async () => {
  await render(ShowcaseCatalogPage, {
    providers: [
      provideAppIcons(),
      { provide: NativeNavigation, useValue: { push: vi.fn(), back: vi.fn() } },
    ],
  });
  const user = userEvent.setup();
  const input = screen.getByLabelText('Search capabilities');
  await user.type(input, 'QR');
  expect(screen.getByRole('button', { name: 'Explore Camera & barcodes' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Explore WebView' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Clear search' }));
  await user.type(input, 'unknown-feature');
  expect(screen.getByText('No capabilities match your search.')).toBeTruthy();
  await user.press(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('button', { name: 'Explore WebView' })).toBeTruthy();
});
