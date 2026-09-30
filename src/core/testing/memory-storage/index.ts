import type { AppStorage } from './types';
export class MemoryStorage implements AppStorage {
  readonly values = new Map<string, string>();
  readonly secrets = new Map<string, string>();
  get(key: string) {
    return this.values.get(key) ?? null;
  }
  set(key: string, value: string): void {
    this.values.set(key, value);
  }
  remove(key: string): void {
    this.values.delete(key);
  }
  async getSecret(key: string) {
    return this.secrets.get(key) ?? null;
  }
  async setSecret(key: string, value: string): Promise<void> {
    this.secrets.set(key, value);
  }
  async removeSecret(key: string): Promise<void> {
    this.secrets.delete(key);
  }
}
