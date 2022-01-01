import type {Config} from '@jest/types';
// const { pathsToModuleNameMapper } = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
// const { compilerOptions } = require('./tsconfig');

// Sync object
const config: Config.InitialOptions = {
  // preset: 'react-native',
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  notify: true,
  notifyMode: "always",
  setupFiles: ['./tests/setup.ts'],
};
export default config;
