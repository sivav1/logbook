import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/lib': resolve(__dirname, 'src/lib'),
    },
  },
});
