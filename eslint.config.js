import neostandard from 'neostandard'
import vitest from '@vitest/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import promise from 'eslint-plugin-promise'
import globals from 'globals'

const customIgnores = ['.server', '.public', 'src/__fixtures__', 'coverage']

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...neostandard({
    env: ['node', 'vitest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore(), ...customIgnores],
    noJsx: true,
    noStyle: true
  }),
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      import: importPlugin,
      prettier,
      promise
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'error',
      'import/extensions': ['error', 'always', { ignorePackages: true }],
      'import/default': 'off',
      'import/namespace': 'off',
      'n/no-extraneous-require': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-missing-require': 'off',
      'n/no-missing-import': 'off'
    },
    settings: {
      'import/resolver': {
        node: true
      }
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node }
    }
  },
  {
    files: ['**/*.test.js'],
    plugins: {
      vitest
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals
      }
    },
    rules: {
      ...vitest.configs.recommended.rules
    }
  }
]
