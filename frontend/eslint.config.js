import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([

  // ==========================================
  // IGNORE GENERATED / BUILD FILES
  // ==========================================

  globalIgnores([
    'dist/**',
    '.next/**',
    '.vercel/**',
    'node_modules/**'
  ]),

  // ==========================================
  // SOURCE FILES
  // ==========================================

  {
    files: ['**/*.{js,jsx}'],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],

    languageOptions: {
      ecmaVersion: 'latest',

      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

]);
