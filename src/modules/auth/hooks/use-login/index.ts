import { inject, signal } from '@angular/core';
import { email, form, minLength, required, submit } from '@angular/forms/signals';
import { Keyboard } from '@ng-native/device';
import { ActivatedRoute } from '@angular/router';
import { appLinkParent, appLinkTarget } from '@/modules/showcase/utils/app-link';
import { NativeNavigation } from '@ng-native/router';
import { AuthSession } from '../../services/auth-session/service';
import { env } from '@/core/constants/env';
export function useLogin() {
  const session = inject(AuthSession);
  const navigation = inject(NativeNavigation);
  const route = inject(ActivatedRoute, { optional: true });
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
        let signedIn = false;
        try {
          await session.login(data());
          signedIn = true;
          keyboard.dismiss();
          if (!(await navigation.reset('/home'))) throw new Error('Unable to open home.');
          const target = appLinkTarget(route?.snapshot.queryParamMap.get('returnTo') ?? null);
          if (target && target !== '/home') {
            const parent = appLinkParent(target);
            if (parent && parent !== '/home' && !(await navigation.push(parent)))
              throw new Error('Unable to open the showcase.');
            if (!(await navigation.push(target)))
              throw new Error('Unable to open the requested destination.');
          }
        } catch {
          error.set(
            signedIn
              ? 'Signed in, but the requested screen could not open. Restart the app to continue.'
              : 'Unable to sign in. Check your credentials and try again.',
          );
        }
      },
    });
  }

  return { error: error.asReadonly(), loginForm, login };
}
