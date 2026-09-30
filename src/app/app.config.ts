import { inject } from '@angular/core';
import { withInterceptors } from '@angular/common/http';
import { provideNativeHttpClient } from '@ng-native/platform/http';
import { provideNativeRouter } from '@ng-native/router';
import { env } from '@/core/constants/env';
import { authInterceptor } from '@/core/api/auth-interceptor';
import { AUTH_BACKEND } from '@/modules/auth/services/auth-backend/service';
import { MockAuthBackend } from '@/modules/auth/services/mock-auth-backend/service';
import { HttpAuthBackend } from '@/modules/auth/services/http-auth-backend/service';
import { routes } from './app.routes';
export const appConfig = {
  providers: [
    provideNativeRouter(routes),
    provideNativeHttpClient(withInterceptors([authInterceptor])),
    {
      provide: AUTH_BACKEND,
      useFactory: () => (env.authMock ? new MockAuthBackend() : inject(HttpAuthBackend)),
    },
  ],
};
