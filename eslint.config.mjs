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
    files: ['src/**/*.ts'],
    ignores: ['src/**/types.ts', 'src/modules/**/types/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSInterfaceDeclaration, TSTypeAliasDeclaration',
          message:
            'Declare interfaces and named type aliases in the sibling types.ts or a feature types directory.',
        },
      ],
    },
  },
  {
    files: ['src/main.ts', '**/*.js', '**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
);
