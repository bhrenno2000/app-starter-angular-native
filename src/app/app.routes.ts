import type { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: '',
    loadChildren: async () => {
      const modules = await Promise.all([
        import('@/modules/auth/routes'),
        import('@/modules/home/routes'),
        import('@/modules/showcase/routes'),
      ]);
      return modules.flatMap((module) => module.routes);
    },
  },
  { path: '**', redirectTo: 'home' },
];
