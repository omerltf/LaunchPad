module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  setupFiles: ['<rootDir>/tests/env-setup.js']
};
