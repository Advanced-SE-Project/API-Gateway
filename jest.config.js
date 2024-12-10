/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest', // Use ts-jest for TypeScript compatibility
  testEnvironment: 'node', // Specify the test environment (e.g., Node.js)
  moduleFileExtensions: ['ts', 'js'], // Recognize .ts and .js files
  testMatch: ['**/*.test.ts'], // Match test files with a .test.ts extension
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform .ts files using ts-jest
  },
};