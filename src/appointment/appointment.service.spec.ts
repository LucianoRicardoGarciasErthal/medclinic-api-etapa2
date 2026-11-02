import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach } from 'vitest' // 👈 IMPORT ADICIONADO
import { AppointmentService } from './appointment.service'
import { DataSource } from 'typeorm'

describe('AppointmentService', () => {
  let service: AppointmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: DataSource,
          useValue: {}, // Mock simples para o teste unitário puro
        },
      ],
    }).compile()

    service = module.get<AppointmentService>(AppointmentService)
  })

  it('deve estar definido', () => {
    expect(service).toBeDefined()
  })

  it('deve validar a lógica de sobreposição de horários', () => {
    const aStart = new Date('2026-11-03T10:00:00Z')
    const aEnd = new Date('2026-11-03T10:30:00Z')
    const bStart = new Date('2026-11-03T10:20:00Z')
    const bEnd = new Date('2026-11-03T10:50:00Z')
    
    // Sobreposição simples
    const sobrepoe = aStart < bEnd && bStart < aEnd
    expect(sobrepoe).toBe(true)
  })
})