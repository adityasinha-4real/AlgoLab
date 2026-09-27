import js from '@eslint/js'
import importX from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    rules: {
      // The algorithm engine must stay independent from React/the DOM so it
      // can be tested and reused without a UI.
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/core',
              from: './src/ui',
              message: 'core/ must not depend on ui/.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'core/ must stay framework-independent.',
            },
            {
              name: 'react-dom',
              message: 'core/ must stay framework-independent.',
            },
          ],
        },
      ],
    },
  },
)
