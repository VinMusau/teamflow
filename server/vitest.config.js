import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // Test env vars so imports don't blow up
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
    },
  },
});