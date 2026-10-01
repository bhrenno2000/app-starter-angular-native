import { fileURLToPath } from 'node:url';
import { ngNative } from '@ng-native/testing/vitest';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [ngNative({ inline: ['@tanstack/angular-query-experimental', '@tanstack/query-core'] })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { globals: true, include: ['src/**/*.spec.ts'] },
});
