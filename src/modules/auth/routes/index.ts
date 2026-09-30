import type { Routes } from '@angular/router';
import { guestGuard } from './auth/guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('../pages/login/page').then((m) => m.AuthLoginPage),
  },
];
