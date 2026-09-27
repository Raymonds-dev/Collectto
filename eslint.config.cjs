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
      // Regras do React Compiler introduzidas no Expo 57 que conflitam com Reanimated SharedValues (.value =) e component patterns existentes
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
