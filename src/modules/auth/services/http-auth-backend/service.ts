import { Injectable, inject } from '@angular/core';
import { z } from 'zod';
import { ApiClient } from '@/core/api/api-client/service';
import type { AuthBackend } from '../auth-backend/service';
import { sessionSchema, userSchema, type LoginRequest } from '../../types/auth';
@Injectable({ providedIn: 'root' })
export class HttpAuthBackend implements AuthBackend {
  private readonly api = inject(ApiClient);
  login(data: LoginRequest) {
    return this.api.request('POST', '/auth/login', sessionSchema, data);
  }
  refresh(refreshToken: string) {
    return this.api.request('POST', '/auth/refresh', sessionSchema, { refreshToken });
  }
  getMe(accessToken: string) {
    return this.api.request('GET', '/users/me', userSchema, undefined, accessToken);
  }
  async logout(accessToken: string | null): Promise<void> {
    await this.api.request('POST', '/auth/logout', z.null(), undefined, accessToken ?? undefined);
  }
}
