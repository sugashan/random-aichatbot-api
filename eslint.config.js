import globals from 'globals';
import pluginJs from '@eslint/js';
import jest from 'eslint-plugin-jest';

export default [
  { languageOptions: { globals: { ...globals.node } } },
  pluginJs.configs.recommended,
  {
    files: ['*/**/*.test.js'],
    ...jest.configs['flat/recommended'],
  },
];
