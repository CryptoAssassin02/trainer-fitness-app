// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'mocks/**',
        '.next/',
        'public/',
        'coverage/',
        'vitest.config.ts',
        '**/*.d.ts',
      ],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})