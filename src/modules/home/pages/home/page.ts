import type { ThemeOption } from './types';
import { Component, inject, signal } from '@angular/core';
import { SafeAreaView, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Button } from '@/shared/components/button/index';
import { Card } from '@/shared/components/card/index';
import { Typography } from '@/shared/components/typography/index';
import { ThemePreference } from '@/core/theme/theme-preference';
import { AuthSession } from '@/modules/auth/services/auth-session/service';
@Component({
  selector: 'app-home-page',
  imports: [SafeAreaView, ScrollView, Text, View, Button, Card, Typography],
  templateUrl: './page.html',
  styles: `
    :host {
      flex: 1;
    }
  `,
})
export class HomePage {
  protected readonly session = inject(AuthSession);
  protected readonly theme = inject(ThemePreference);
  private readonly navigation = inject(NativeNavigation);
  protected readonly leaving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly options: readonly ThemeOption[] = [
    { mode: 'system', label: 'System' },
    { mode: 'light', label: 'Light' },
    { mode: 'dark', label: 'Dark' },
  ];
  protected async logout(): Promise<void> {
    if (this.leaving()) return;
    this.leaving.set(true);
    this.error.set(null);
    try {
      await this.session.logout();
    } catch {
      this.error.set('Signed out on this device. The server did not confirm sign-out.');
    }
    try {
      await this.navigation.reset('/auth/login');
    } catch {
      this.error.set('Unable to open sign-in. Restart the app.');
    } finally {
      this.leaving.set(false);
    }
  }
}
