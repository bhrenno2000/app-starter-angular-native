import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, minLength, required, submit } from '@angular/forms/signals';
import { Text } from '@ng-native/components';
import { Keyboard } from '@ng-native/device';
import { NativeNavigation } from '@ng-native/router';
import { Form } from '@/shared/components/form/form';
import { Button } from '@/shared/components/button/button';
import { Input } from '@/shared/components/input/input';
import { Typography } from '@/shared/components/typography/typography';
import { FormScreenLayout } from '@/shared/components/form-screen-layout/form-screen-layout';
import { AuthSession } from '../../services/auth-session';
import { env } from '@/core/constants/env';
@Component({
  selector: 'app-auth-login-page',
  imports: [FormField, Button, Input, Typography, FormScreenLayout, Text, Form],
  template: `<app-form-screen-layout
    ><app-typography variant="title">Bem-vindo de volta</app-typography
    ><app-form
      ><app-input
        label="E-mail"
        placeholder="email@exemplo.com"
        keyboardType="email-address"
        [formField]="loginForm.email" /><app-input
        label="Senha"
        placeholder="••••••••"
        [password]="true"
        [formField]="loginForm.password"
    /></app-form>
    @if (error()) {
      <text accessibilityRole="alert" class="text-sm text-danger">{{ error() }}</text>
    }
    <app-form footer
      ><app-button
        label="Entrar"
        [loading]="loginForm().submitting()"
        (pressed)="login()" /></app-form
  ></app-form-screen-layout>`,
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
    password: env.authMock ? 'password' : '',
  });
  protected readonly loginForm = form(this.data, (path) => {
    required(path.email, { message: 'Informe seu e-mail.' });
    email(path.email, { message: 'Informe um e-mail válido.' });
    required(path.password, { message: 'Informe sua senha.' });
    minLength(path.password, 6, { message: 'A senha deve ter pelo menos 6 caracteres.' });
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
          this.error.set('Não foi possível entrar. Verifique seus dados e tente novamente.');
        }
      },
    });
  }
}
