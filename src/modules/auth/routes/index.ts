import type { Routes } from '@angular/router';
import { guestGuard } from './auth/guard';
export const routes: Routes = [
  { path: 'auth', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('../pages/login/page').then((m) => m.AuthLoginPage),
  },
];
