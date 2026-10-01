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
    files: [
      'src/modules/**/pages/*.ts',
      'src/modules/**/pages/**/*.ts',
      'src/shared/components/**/*.ts',
      'src/modules/**/components/**/*.ts',
    ],
    ignores: ['**/*.spec.ts', '**/types.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'expo-*',
                'react-native',
                'react-native-*',
                '@tanstack/*',
                'zustand',
                'zustand/*',
                '@ng-native/device',
                '@ng-native/router',
                '@ng-native/platform',
                '@ng-native/fabric',
              ],
              message:
                'Consume native and third-party logic through a hook; rendering primitives and Angular framework imports remain allowed.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/core/initializers/fonts/index.ts',
      'src/modules/showcase/hooks/use-video/index.ts',
      'src/modules/showcase/hooks/use-web-view/index.ts',
      'src/modules/showcase/hooks/use-camera/index.ts',
      'src/modules/showcase/hooks/use-gallery/index.ts',
      '**/*.js',
      '**/*.cjs',
    ],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
);
