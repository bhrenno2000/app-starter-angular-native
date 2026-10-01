import { InjectionToken } from '@angular/core';
import type { SessionResourceCleanup } from './types';
export const SESSION_RESOURCE_CLEANUP = new InjectionToken<SessionResourceCleanup>(
  'session-resource-cleanup',
);
