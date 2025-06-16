import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules, // ⭐ Adaugă regulile de la react!
      ...reactHooks.configs.recommended.rules,

      // reguli suplimentare stricte:
      'react/props-types': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off', // Nu e necesar în React 17+
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error', // ⭐ Ajută la JSX nedefinit
      'no-undef': 'error',            // 🔥 Variabile nedefinite
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: 'detect', // 🔍 detectează automat versiunea React
      },
    },
  },
];
