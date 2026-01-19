import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for lightweight DOM testing
    environment: 'happy-dom',

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Setup file to run before each test file
    setupFiles: ['./tests/unit/helpers/dom-setup.js'],

    // Test file patterns
    include: [
      'tests/unit/**/*.test.js',
      'tests/build/**/*.test.js'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Coverage thresholds
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      // Exclude test files and config from coverage
      exclude: [
        'tests/**',
        '*.config.js',
        'dist/**',
        'node_modules/**',
      ],
    },

    // Test timeout
    testTimeout: 10000,

    // Hooks timeout
    hookTimeout: 10000,
  },
});
