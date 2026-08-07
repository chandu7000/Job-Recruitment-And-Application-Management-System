export default {
  testEnvironment: "node",

  roots: [
    "<rootDir>/src/tests"
  ],

  testMatch: [
    "**/*.test.js"
  ],

  setupFiles: [
    "<rootDir>/src/tests/setEnv.js"
  ],

  setupFilesAfterEnv: [
    "<rootDir>/src/tests/setup.js"
  ],

  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/tests/**",
    "!src/migrations/**",
    "!src/seeders/**"
  ],

  coverageDirectory: "coverage",

  clearMocks: true,

  restoreMocks: true,

  verbose: true,

  forceExit: true,

  detectOpenHandles: true
};