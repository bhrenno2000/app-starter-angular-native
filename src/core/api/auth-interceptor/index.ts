import type { HttpInterceptorFn } from './types';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthSession } from '@/modules/auth/services/auth-session/service';
import { env } from '@/core/constants/env';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const apiOrigin = env.apiUrl.replace(/\/$/, '');
  if (!request.url.startsWith(`${apiOrigin}/`) || request.url.startsWith(`${apiOrigin}/auth/`))
    return next(request);
  const token = session.accessToken();
  const authenticated = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(authenticated).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !session.authenticated())
        return throwError(() => error);
      return from(session.refresh()).pipe(
        switchMap((updated) =>
          next(request.clone({ setHeaders: { Authorization: `Bearer ${updated.accessToken}` } })),
        ),
      );
    }),
  );
};
