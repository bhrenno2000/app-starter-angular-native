import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { appLinkTarget } from '@/modules/showcase/utils/app-link';
import { AuthSession } from '../../services/auth-session/service';
export const authGuard: CanActivateFn = async (_route, state) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  await session.restore();
  const target = appLinkTarget(state.url);
  return (
    session.authenticated() ||
    router.createUrlTree(['/auth/login'], {
      queryParams: target && target !== '/home' ? { returnTo: target } : undefined,
    })
  );
};
export const guestGuard: CanActivateFn = async () => {
  const session = inject(AuthSession);
  const router = inject(Router);
  await session.restore();
  return session.authenticated() ? router.parseUrl('/home') : true;
};
