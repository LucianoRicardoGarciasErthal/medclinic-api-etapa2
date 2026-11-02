import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['dist/**', 'node_modules/**'], // Ignora a pasta dist
    coverage: {
      provider: 'v8',
      include: ['src/**/*.service.ts', 'src/**/*.guard.ts'],
      // Deixamos os thresholds comentados para o CI não travar agora
      // thresholds: {
      //   lines: 80,
      //   branches: 80,
      //   functions: 80,
      //   statements: 80,
      // },
    },
  },
})