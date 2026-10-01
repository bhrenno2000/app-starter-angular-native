import { expect, test } from 'vitest';
import { ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { showcaseCategoryGuard } from './guard';
test('accepts a known category from the module-owned full route path', () => {
  expect(
    showcaseCategoryGuard(
      { path: 'showcase/:category' },
      [new UrlSegment('showcase', {}), new UrlSegment('query', {})],
      new ActivatedRouteSnapshot(),
    ),
  ).toBe(true);
});
