export default {
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['*/**/*.test.js'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'json'],
  coverageDirectory: 'test-coverage/unit',
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/mocks',
  ],
};
