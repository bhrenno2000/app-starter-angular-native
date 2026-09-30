import { InjectionToken } from '@angular/core';
import type { UserData } from '@/shared/models/user';
import type { AuthSession, LoginRequest } from '../types/auth';
export interface AuthBackend {
  login(data: LoginRequest): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  getMe(accessToken: string): Promise<UserData>;
  logout(accessToken: string | null): Promise<void>;
}
export const AUTH_BACKEND = new InjectionToken<AuthBackend>('auth-backend');
