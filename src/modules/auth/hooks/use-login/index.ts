import { inject, signal } from '@angular/core';
import { email, form, minLength, required, submit } from '@angular/forms/signals';
import { Keyboard } from '@ng-native/device';
import { NativeNavigation } from '@ng-native/router';
import { AuthSession } from '../../services/auth-session/service';
import { env } from '@/core/constants/env';
export function useLogin() {
  const session = inject(AuthSession);
  const navigation = inject(NativeNavigation);
  const keyboard = inject(Keyboard);
  const error = signal<string | null>(null);
  const data = signal({
    email: env.authMock ? 'user@example.com' : '',
    password: '',
  });
  const loginForm = form(data, (path) => {
    required(path.email, { message: 'Enter your email.' });
    email(path.email, { message: 'Enter a valid email.' });
    required(path.password, { message: 'Enter your password.' });
    minLength(path.password, 6, { message: 'Password must contain at least 6 characters.' });
  });
  async function login(): Promise<void> {
    error.set(null);
    await submit(loginForm, {
      action: async () => {
        try {
          await session.login(data());
          keyboard.dismiss();
          await navigation.reset('/home');
        } catch {
          error.set('Unable to sign in. Check your credentials and try again.');
        }
      },
    });
  }

  return { error: error.asReadonly(), loginForm, login };
}
