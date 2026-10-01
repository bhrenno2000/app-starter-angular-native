import { Component } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Text } from '@ng-native/components';
import { Form } from '@/shared/components/form/index';
import { Button } from '@/shared/components/button/index';
import { Input } from '@/shared/components/input/index';
import { Typography } from '@/shared/components/typography/index';
import { FormScreenLayout } from '@/shared/components/form-screen-layout/index';
import { useLogin } from '../../hooks/use-login';
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
  protected readonly auth = useLogin();
}
