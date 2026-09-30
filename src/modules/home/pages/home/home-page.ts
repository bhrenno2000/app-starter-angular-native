import { Component, inject, signal } from '@angular/core';
import { SafeAreaView, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Button } from '@/shared/components/button/button';
import { Card } from '@/shared/components/card/card';
import { Typography } from '@/shared/components/typography/typography';
import { ThemePreference, type ThemeMode } from '@/core/theme/theme-preference';
import { AuthSession } from '@/modules/auth/services/auth-session';
@Component({
  selector: 'app-home-page',
  imports: [SafeAreaView, ScrollView, Text, View, Button, Card, Typography],
  template: `<safe-area-view class="flex-1 bg-background"
    ><scroll-view class="flex-1"
      ><view class="gap-6 px-4 pt-4 pb-6"
        ><view class="gap-1"
          ><app-typography variant="muted">Olá,</app-typography
          ><app-typography variant="heading">{{
            session.user()?.name ?? 'Visitante'
          }}</app-typography
          ><app-typography variant="muted">{{ session.user()?.email ?? '' }}</app-typography></view
        ><app-card
          ><text class="font-semibold text-base text-foreground">Tema</text
          ><view class="flex-row gap-2">
            @for (option of options; track option.mode) {
              <view class="flex-1"
                ><app-button
                  [label]="option.label"
                  [variant]="theme.mode() === option.mode ? 'solid' : 'outline'"
                  (pressed)="theme.set(option.mode)"
              /></view>
            }</view
        ></app-card>
        @if (error()) {
          <text accessibilityRole="alert" class="text-sm text-danger">{{ error() }}</text>
        }
        <app-button
          label="Sair"
          icon="lucideLogOut"
          variant="outline"
          [danger]="true"
          [loading]="leaving()"
          (pressed)="logout()" /></view></scroll-view
  ></safe-area-view>`,
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
  protected readonly options: readonly { mode: ThemeMode; label: string }[] = [
    { mode: 'system', label: 'Sistema' },
    { mode: 'light', label: 'Claro' },
    { mode: 'dark', label: 'Escuro' },
  ];
  protected async logout(): Promise<void> {
    if (this.leaving()) return;
    this.leaving.set(true);
    this.error.set(null);
    try {
      await this.session.logout();
    } catch {
      this.error.set('Sessão encerrada neste dispositivo. O servidor não confirmou a saída.');
    }
    try {
      await this.navigation.reset('/auth/login');
    } catch {
      this.error.set('Não foi possível abrir o login. Reinicie o app.');
    } finally {
      this.leaving.set(false);
    }
  }
}
