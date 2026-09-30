import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../services/auth-session/service';
export const authGuard: CanActivateFn = async () => {
  const session = inject(AuthSession);
  const router = inject(Router);
  await session.restore();
  return session.authenticated() || router.parseUrl('/auth/login');
};
export const guestGuard: CanActivateFn = async () => {
  const session = inject(AuthSession);
  const router = inject(Router);
  await session.restore();
  return session.authenticated() ? router.parseUrl('/home') : true;
};
