import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      '.angular-native/**',
      'dist/**',
      'ios/**',
      'android/**',
      '.claude/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/main.ts', '**/*.js', '**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
);
