module.exports = {
  testEnvironment: 'allure-jest/node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testEnvironmentOptions: {
    resultsDir: 'allure-results',
  },
};