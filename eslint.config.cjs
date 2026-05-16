const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'build/*',
      'coverage/*',
      '.expo/*',
      'node_modules/*',
      '**/*.min.js',
      '.github/*',
      '.specify/*',
      'spec/*',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/display-name': 'off',
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*', '../../../*', '../../../../*', '../../../../../*'],
              message: 'Use aliases @/ em vez de imports relativos longos.',
            },
          ],
        },
      ],
    },
  },
]);
