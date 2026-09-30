import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@/modules/auth/routes/auth/guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () => import('@/modules/auth/pages/login/page').then((m) => m.AuthLoginPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('@/modules/home/pages/home/page').then((m) => m.HomePage),
  },
  { path: '**', redirectTo: 'home' },
];
