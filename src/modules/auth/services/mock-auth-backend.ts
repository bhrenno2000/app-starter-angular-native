import type { AuthBackend } from './auth-backend';
import type { AuthSession, LoginRequest } from '../types/auth';
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 150));
const user = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Mock User',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
export class MockAuthBackend implements AuthBackend {
  async login(data: LoginRequest): Promise<AuthSession> {
    await wait();
    return {
      accessToken: 'mock-access-token',
      refreshToken: `mock:${data.email}`,
      expiresIn: 3600,
      user: { ...user, email: data.email },
    };
  }
  refresh(refreshToken: string): Promise<AuthSession> {
    if (!refreshToken.startsWith('mock:'))
      return Promise.reject(new Error('Sessão de teste inválida.'));
    return this.login({ email: refreshToken.slice(5), password: '' });
  }
  async getMe(_accessToken: string) {
    await wait();
    return user;
  }
  async logout(_accessToken: string | null): Promise<void> {
    await wait();
  }
}
