import { inject, signal } from '@angular/core';
import { NativeNavigation } from '@ng-native/router';
import { ThemePreference } from '@/core/theme/theme-preference';
import { AuthSession } from '@/modules/auth/services/auth-session/service';
import type { ThemeOption } from './types';
export function useHome() {
  const session = inject(AuthSession);
  const theme = inject(ThemePreference);
  const navigation = inject(NativeNavigation);
  const leaving = signal(false);
  const error = signal<string | null>(null);
  const options: readonly ThemeOption[] = [
    { mode: 'system', label: 'System' },
    { mode: 'light', label: 'Light' },
    { mode: 'dark', label: 'Dark' },
  ];
  async function openShowcase(): Promise<void> {
    error.set(null);
    try {
      if (!(await navigation.push('/showcase'))) error.set('Unable to open the native showcase.');
    } catch (cause) {
      error.set(cause instanceof Error ? cause.message : 'Unable to open the native showcase.');
    }
  }
  async function logout(): Promise<void> {
    if (leaving()) return;
    leaving.set(true);
    error.set(null);
    try {
      await session.logout();
    } catch {
      error.set('Signed out on this device. The server did not confirm sign-out.');
    }
    try {
      await navigation.reset('/auth/login');
    } catch {
      error.set('Unable to open sign-in. Restart the app.');
    } finally {
      leaving.set(false);
    }
  }

  return {
    user: session.user,
    themeMode: theme.mode,
    setTheme: (mode: ThemeOption['mode']) => theme.set(mode),
    leaving: leaving.asReadonly(),
    error: error.asReadonly(),
    options,
    logout,
    openShowcase,
  };
}
