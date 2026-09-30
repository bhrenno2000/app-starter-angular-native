import { Injectable, computed, inject, signal } from '@angular/core';
import type { UserData } from '@/shared/models/user';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MMKV_KEYS, SECURE_KEYS } from '@/core/storage/keys';
import { AUTH_BACKEND } from './auth-backend';
import type { AuthSession as Session, LoginRequest } from '../types/auth';
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly backend = inject(AUTH_BACKEND);
  private readonly storage = inject(APP_STORAGE);
  private readonly current = signal<Session | null>(null);
  private restoring: Promise<void> | null = null;
  private refreshing: Promise<Session> | null = null;
  private generation = 0;
  private persistence: Promise<void> = Promise.resolve();
  readonly user = computed<UserData | null>(() => this.current()?.user ?? null);
  readonly accessToken = computed(() => this.current()?.accessToken ?? null);
  readonly authenticated = computed(() => this.current() !== null);
  async restore(): Promise<void> {
    this.restoring ??= this.restoreStoredSession();
    await this.restoring;
  }
  private async restoreStoredSession(): Promise<void> {
    const generation = this.generation;
    const token = await this.storage.getSecret(SECURE_KEYS.refreshToken);
    if (!token || generation !== this.generation) return;
    try {
      await this.save(await this.backend.refresh(token), generation);
    } catch {
      if (generation === this.generation) await this.clear();
    }
  }
  async login(data: LoginRequest): Promise<void> {
    const generation = ++this.generation;
    await this.save(await this.backend.login(data), generation);
  }
  private persist(action: () => Promise<void>): Promise<void> {
    const pending = this.persistence.then(action);
    this.persistence = pending.catch(() => {});
    return pending;
  }
  private save(session: Session, generation: number): Promise<void> {
    return this.persist(async () => {
      if (generation !== this.generation) return;
      await this.storage.setSecret(SECURE_KEYS.refreshToken, session.refreshToken);
      if (generation !== this.generation) return;
      this.storage.set(MMKV_KEYS.userStore, JSON.stringify(session.user));
      this.current.set(session);
    });
  }
  async refresh(): Promise<Session> {
    if (this.refreshing) return this.refreshing;
    const token = this.current()?.refreshToken;
    if (!token) throw new Error('Sessão expirada. Entre novamente.');
    const generation = this.generation;
    this.refreshing = this.backend
      .refresh(token)
      .then(async (session) => {
        await this.save(session, generation);
        if (generation !== this.generation || !this.authenticated()) {
          throw new Error('A sessão mudou. Entre novamente.');
        }
        return session;
      })
      .catch(async (error: unknown) => {
        if (generation === this.generation) await this.clear();
        throw error;
      })
      .finally(() => {
        this.refreshing = null;
      });
    return this.refreshing;
  }
  async logout(): Promise<void> {
    const token = this.accessToken();
    try {
      await this.backend.logout(token);
    } finally {
      await this.clear();
    }
  }
  private async clear(): Promise<void> {
    this.generation++;
    this.current.set(null);
    try {
      this.storage.remove(MMKV_KEYS.userStore);
    } finally {
      await this.persist(() => this.storage.removeSecret(SECURE_KEYS.refreshToken));
    }
  }
}
