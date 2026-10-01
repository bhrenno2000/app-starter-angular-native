import { expect, test } from 'vitest';
import { appLinkParent, appLinkTarget, parseAppLink } from './index';
test('accepts configured showcase links and builds their native back stack', () => {
  expect(parseAppLink('appstarterangular://showcase/query')).toBe('/showcase/query');
  expect(parseAppLink('appstarterangular:///showcase/state')).toBe('/showcase/state');
  expect(parseAppLink('APPSTARTERANGULAR://home')).toBe('/home');
  expect(appLinkParent('/showcase/query')).toBe('/showcase');
  expect(appLinkParent('/showcase')).toBeNull();
  expect(appLinkParent('/home')).toBeNull();
});
test.each([
  'https://example.com/showcase/query',
  'otherapp://showcase/query',
  'appstarterangular://expo-development-client/?url=http://localhost:8094',
  'appstarterangular://showcase/unknown',
  'appstarterangular://showcase/query?token=secret',
  'appstarterangular://showcase/query#fragment',
  'appstarterangular://showcase/%71uery',
  'appstarterangular://showcase/../home',
  'appstarterangular://auth/login',
])('ignores unsupported or ambiguous external URL %s', (url) => {
  expect(parseAppLink(url)).toBeNull();
});
test('validates login return destinations without accepting arbitrary redirects', () => {
  expect(appLinkTarget('/showcase')).toBe('/showcase');
  expect(appLinkTarget('//example.com')).toBeNull();
  expect(appLinkTarget('/showcase/query?returnTo=//example.com')).toBeNull();
});
