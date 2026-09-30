import { InjectionToken } from '@angular/core';
import type { AuthBackend } from './types';
export const AUTH_BACKEND = new InjectionToken<AuthBackend>('auth-backend');
