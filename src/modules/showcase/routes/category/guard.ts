import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanMatchFn } from '@angular/router';
import { findShowcaseCategory } from '../../hooks/use-showcase';
export const showcaseCategoryGuard: CanMatchFn = (_route, segments) =>
  findShowcaseCategory(segments[0]?.path ?? null) ? true : inject(Router).parseUrl('/showcase');
