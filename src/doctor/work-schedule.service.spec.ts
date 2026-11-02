import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkScheduleService } from './work-schedule.service'
import { DataSource } from 'typeorm'

describe('WorkScheduleService', () => {
  let service: WorkScheduleService
  let dataSource: any

  beforeEach(async () => {
    const mockManager = {
      delete: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
    }

    dataSource = {
      getRepository: vi.fn().mockReturnValue({
        findOneBy: vi.fn(),
        find: vi.fn(),
      }),
      transaction: vi.fn().mockImplementation((cb) => cb(mockManager)),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkScheduleService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile()

    service = module.get<WorkScheduleService>(WorkScheduleService)
  })

  it('deve rejeitar turnos que se sobrepõem no mesmo dia', async () => {
    const dto = {
      shifts: [
        { weekDay: 1, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 },
        { weekDay: 1, startTime: '11:00', endTime: '15:00', slotDurationMinutes: 30 },
      ],
    }
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    await expect(service.replaceSchedule(1, dto)).rejects.toThrow('DADOS_INVALIDOS')
  })

  it('deve aceitar turnos encostados (ex: 08:00-12:00 e 12:00-15:00)', async () => {
    const dto = {
      shifts: [
        { weekDay: 1, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 },
        { weekDay: 1, startTime: '12:00', endTime: '15:00', slotDurationMinutes: 30 },
      ],
    }
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    const result = await service.replaceSchedule(1, dto)
    expect(result).toEqual({ shifts: dto.shifts })
  })

  it('deve lançar erro ao tentar substituir escala de médico inexistente', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue(null)
    await expect(service.replaceSchedule(99, { shifts: [] })).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })

  // Novos testes para cobrir o método findByDoctor
  it('deve buscar a escala de um médico com sucesso', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    dataSource.getRepository().find.mockResolvedValue([
      { id: 1, weekDay: 1, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }
    ])

    const result = await service.findByDoctor(1)
    expect(result.shifts.length).toBe(1)
  })

  it('deve lançar erro ao buscar escala de médico inexistente', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue(null)
    await expect(service.findByDoctor(99)).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })
})