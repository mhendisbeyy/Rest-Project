import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', include: ['tests/**/*.test.{js,jsx}'], setupFiles: ['./tests/setup.js'], restoreMocks: true,
    // Keep DOM-heavy PrimeReact suites from competing for the per-test time budget.
    fileParallelism: false,
    testTimeout: 10000,
  },
});
