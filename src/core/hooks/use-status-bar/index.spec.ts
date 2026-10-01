import { Component, signal } from '@angular/core';
import { ColorScheme, StatusBar } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useStatusBar } from './index';
@Component({ selector: 'test-status-bar', template: '' })
class Host {
  constructor() {
    useStatusBar();
  }
}
afterEach(cleanup);
test('keeps native status bar contrast synchronized with appearance changes', async () => {
  const current = signal('dark');
  const set = vi.fn();
  const { detectChanges } = await render(Host, {
    providers: [
      { provide: ColorScheme, useValue: { current } },
      { provide: StatusBar, useValue: { set } },
    ],
  });
  expect(set).toHaveBeenLastCalledWith({ style: 'light', animated: false });
  current.set('light');
  await detectChanges();
  expect(set).toHaveBeenLastCalledWith({ style: 'dark', animated: false });
});
