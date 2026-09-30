import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, minLength, required, submit } from '@angular/forms/signals';
import { Text } from '@ng-native/components';
import { Keyboard } from '@ng-native/device';
import { NativeNavigation } from '@ng-native/router';
import { Form } from '@/shared/components/form/index';
import { Button } from '@/shared/components/button/index';
import { Input } from '@/shared/components/input/index';
import { Typography } from '@/shared/components/typography/index';
import { FormScreenLayout } from '@/shared/components/form-screen-layout/index';
import { AuthSession } from '../../services/auth-session/service';
import { env } from '@/core/constants/env';
@Component({
  selector: 'app-auth-login-page',
  imports: [FormField, Button, Input, Typography, FormScreenLayout, Text, Form],
  templateUrl: './page.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class AuthLoginPage {
  private readonly session = inject(AuthSession);
  private readonly navigation = inject(NativeNavigation);
  private readonly keyboard = inject(Keyboard);
  protected readonly error = signal<string | null>(null);
  protected readonly data = signal({
    email: env.authMock ? 'user@example.com' : '',
    password: '',
  });
  protected readonly loginForm = form(this.data, (path) => {
    required(path.email, { message: 'Enter your email.' });
    email(path.email, { message: 'Enter a valid email.' });
    required(path.password, { message: 'Enter your password.' });
    minLength(path.password, 6, { message: 'Password must contain at least 6 characters.' });
  });
  protected async login(): Promise<void> {
    this.error.set(null);
    await submit(this.loginForm, {
      action: async () => {
        try {
          await this.session.login(this.data());
          this.keyboard.dismiss();
          await this.navigation.reset('/home');
        } catch {
          this.error.set('Unable to sign in. Check your credentials and try again.');
        }
      },
    });
  }
}
