import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      "src/**/__tests__/**/*.unit.test.{ts,tsx}",
      "src/**/__tests__/**/*.integration.test.{ts,tsx}",
      "src/**/*.unit.test.{ts,tsx}",
      "src/**/*.integration.test.{ts,tsx}"
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/components/ui/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});