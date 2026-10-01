import { SESSION_RESOURCE_CLEANUP } from '@/core/hooks/use-session-cleanup';
import { stopBackgroundLocation } from '@/core/hooks/use-background-location';
import { inject } from '@angular/core';
import { env } from '@/core/constants/env';
import { AUTH_BACKEND } from '@/modules/auth/services/auth-backend/service';
import { MockAuthBackend } from '@/modules/auth/services/mock-auth-backend/service';
import { HttpAuthBackend } from '@/modules/auth/services/http-auth-backend/service';
export function provideAppAuth() {
  return [
    { provide: SESSION_RESOURCE_CLEANUP, useValue: stopBackgroundLocation },
    {
      provide: AUTH_BACKEND,
      useFactory: () => (env.authMock ? new MockAuthBackend() : inject(HttpAuthBackend)),
    },
  ];
}
