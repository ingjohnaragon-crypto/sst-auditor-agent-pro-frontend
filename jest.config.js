module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/src/app/shared/index.ts',
    '^@app/shared/(.*)$': '<rootDir>/src/app/shared/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/index.ts',
    '!src/main.ts',
    '!src/app/app.routes.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
