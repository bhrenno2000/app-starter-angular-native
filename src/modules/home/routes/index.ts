import type { Routes } from '@angular/router';
import { authGuard } from '@/modules/auth/routes/auth/guard';
export const routes: Routes = [
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('../pages/home/page').then((m) => m.HomePage),
  },
];
