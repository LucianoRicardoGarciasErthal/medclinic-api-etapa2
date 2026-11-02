import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: [
        'src/appointment/appointment.service.ts',
        'src/doctor/work-schedule.service.ts',
        'src/medical-record/medical-record.service.ts',
        'src/patient/patient.service.ts',
        'src/auth/password.service.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
})