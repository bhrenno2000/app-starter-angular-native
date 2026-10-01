import { showcaseCategoryGuard } from './category/guard';
import type { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'showcase',
    loadComponent: () => import('../pages/catalog/page').then((m) => m.ShowcaseCatalogPage),
  },
  {
    path: 'showcase/:category',
    canMatch: [showcaseCategoryGuard],
    loadComponent: () => import('../pages/feature/page').then((m) => m.ShowcaseFeaturePage),
  },
];
