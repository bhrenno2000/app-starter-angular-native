import type { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'auth',
    loadChildren: () => import('@/modules/auth/routes').then((m) => m.routes),
  },
  {
    path: 'home',
    loadChildren: () => import('@/modules/home/routes').then((m) => m.routes),
  },
  { path: '**', redirectTo: 'home' },
];
