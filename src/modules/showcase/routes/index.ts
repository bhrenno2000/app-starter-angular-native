import type { Routes } from '@angular/router';
import { authGuard } from '@/modules/auth/routes/auth/guard';
export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/catalog/page').then((m) => m.ShowcaseCatalogPage),
  },
  {
    path: ':category',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/feature/page').then((m) => m.ShowcaseFeaturePage),
  },
];
