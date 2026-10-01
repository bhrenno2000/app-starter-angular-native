import { Component } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useAppLinks } from './index';
const native = vi.hoisted(() => ({
  getInitialURL: vi.fn(),
  addEventListener: vi.fn(),
  openURL: vi.fn(),
}));
vi.mock('expo-linking', () => native);
@Component({ selector: 'test-app-links', template: '' })
class Host {
  readonly links = useAppLinks();
}
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
test('reads launch links and ignores launcher URLs or platform failures', async () => {
  const { componentRef } = await render(Host);
  native.getInitialURL.mockResolvedValueOnce('appstarterangular://showcase/query');
  expect(await componentRef.instance.links.launchUrl()).toBe('/showcase/query');
  native.getInitialURL.mockResolvedValueOnce('appstarterangular://expo-development-client/?url=x');
  expect(await componentRef.instance.links.launchUrl()).toBeNull();
  native.getInitialURL.mockRejectedValueOnce(new Error('unavailable'));
  expect(await componentRef.instance.links.launchUrl()).toBeNull();
});
test('filters live links and removes the native listener exactly once on destruction', async () => {
  const remove = vi.fn();
  native.addEventListener.mockReturnValue({ remove });
  const { componentRef } = await render(Host);
  const receive = vi.fn();
  const unsubscribe = componentRef.instance.links.subscribe(receive);
  const listener = native.addEventListener.mock.calls[0][1];
  listener({ url: 'https://example.com/showcase/query' });
  listener({ url: 'appstarterangular://showcase/unknown' });
  listener({ url: 'appstarterangular://showcase/query' });
  expect(receive).toHaveBeenCalledExactlyOnceWith('/showcase/query');
  cleanup();
  listener({ url: 'appstarterangular://showcase/state' });
  expect(receive).toHaveBeenCalledTimes(1);
  unsubscribe();
  expect(remove).toHaveBeenCalledTimes(1);
});
