import { cleanup, render, screen, userEvent, waitFor } from '@ng-native/testing';
import { NativeNavigation } from '@ng-native/router';
import { afterEach, expect, test, vi } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { AUTH_BACKEND } from '../../services/auth-backend';
import { MockAuthBackend } from '../../services/mock-auth-backend';
import { AuthLoginPage } from './auth-login-page';
afterEach(cleanup);
async function setup() {
  const backend = new MockAuthBackend();
  const reset = vi.fn().mockResolvedValue(true);
  await render(AuthLoginPage, {
    providers: [
      { provide: APP_STORAGE, useValue: new MemoryStorage() },
      { provide: AUTH_BACKEND, useValue: backend },
      { provide: NativeNavigation, useValue: { reset } },
    ],
  });
  await userEvent.setup().type(screen.getByLabelText('Senha'), 'password');
  return { backend, reset };
}
test('submits login and resets the native stack', async () => {
  const { reset } = await setup();
  await userEvent.setup().press(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(reset).toHaveBeenCalledWith('/home'));
});
test('rejects invalid email without calling the backend', async () => {
  const { backend } = await setup();
  const login = vi.spyOn(backend, 'login');
  const user = userEvent.setup();
  await user.clear(screen.getByLabelText('E-mail'));
  await user.type(screen.getByLabelText('E-mail'), 'invalid');
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(login).not.toHaveBeenCalled();
  expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();
});
test('shows a recoverable login error without navigation', async () => {
  const { backend, reset } = await setup();
  vi.spyOn(backend, 'login').mockRejectedValue(new Error('offline'));
  await userEvent.setup().press(screen.getByRole('button', { name: 'Entrar' }));
  expect(
    await screen.findByText('Não foi possível entrar. Verifique seus dados e tente novamente.'),
  ).toBeTruthy();
  expect(reset).not.toHaveBeenCalled();
});
