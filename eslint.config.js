import pluginSecurity from 'eslint-plugin-security'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // Base config with TypeScript and gitignore integration
  ...neostandard({
    ts: true,
    ignores: resolveIgnoresFromGitignore(),
    filesTs: ['src/**/*.ts', '__tests__/**/*.ts']
  }),

  // Security rules
  pluginSecurity.configs.recommended,

  // Turn off conflicting formatting rules to defer to Prettier
  eslintConfigPrettier,

  // Custom tweaks
  {
    rules: {
      'n/no-process-exit': 'warn',
      'n/no-unsupported-features': 'off',
      'n/no-unpublished-require': 'off',

      // Prettier conflict fix
      '@stylistic/space-before-function-paren': 'off',

      // Disable rarely useful rules
      'n/hashbang': 'off'
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module'
    }
  }
]
