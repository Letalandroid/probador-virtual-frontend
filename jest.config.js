export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.simple.ts'],
  moduleNameMapper: {
    // Specific mocks first (order matters!)
    '^@/config/env$': '<rootDir>/src/__mocks__/env.ts',
    '^@/lib/api$': '<rootDir>/src/__mocks__/api.ts',
    '^@/integrations/supabase/client$': '<rootDir>/src/__mocks__/supabase.ts',
    // Asset mocks - more specific patterns first
    '^@/assets/hero-fashion\\.jpg$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/assets/product-placeholder\\.jpg$': '<rootDir>/src/__mocks__/product-placeholder.js',
    '^@/assets/(.*)$': '<rootDir>/src/__mocks__/fileMock.js',
    // Relative asset imports
    '^../assets/hero-fashion\\.jpg$': '<rootDir>/src/__mocks__/fileMock.js',
    // Generic asset pattern
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    // Generic pattern last
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'es2020',
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        types: ['jest', 'node', '@testing-library/jest-dom'],
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'd.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/test-helpers/',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};




