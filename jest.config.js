// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

export default {
  // Stop running tests after `n` failures
  bail: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "dist/**/*.js",
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "./tests/coverage",

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
  ],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {},

  // The test environment that will be used for testing
  testEnvironment: "jest-environment-jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "<rootDir>/tests/**/*.test.js",
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/coverage/",
  ],

  // Native ESM: tests and compiled sources are loaded by Node, not Babel.
  transform: {},

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "/node_modules/"
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true

};
