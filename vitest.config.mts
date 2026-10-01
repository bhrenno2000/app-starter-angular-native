import { fileURLToPath } from 'node:url';
import { ngNative } from '@ng-native/testing/vitest';
import { defineConfig } from 'vitest/config';
// Version 0.2 points gesture stand-ins at unpublished src files; use its shipped dist copies.
const standIn = (name: string) =>
  fileURLToPath(
    new URL(`./dist/${name}.js`, import.meta.resolve('@ng-native/testing/package.json')),
  );
export default defineConfig({
  plugins: [ngNative({ inline: ['@tanstack/angular-query-experimental', '@tanstack/query-core'] })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@ng-native/components/gestures': standIn('gestures'),
      '@ng-native/components/reanimated': standIn('reanimated'),
      'react-native-gesture-handler': standIn('gesture-handler'),
      'react-native-reanimated': standIn('reanimated-library'),
      'react-native-worklets': standIn('worklets-library'),
    },
  },
  test: { globals: true, include: ['src/**/*.spec.ts'] },
});
