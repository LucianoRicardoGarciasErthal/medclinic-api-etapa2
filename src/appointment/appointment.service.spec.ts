import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AppointmentService } from './appointment.service'
import { DataSource } from 'typeorm'

describe('AppointmentService', () => {
  let service: AppointmentService
  let mockManager: any
  let mockDataSource: any

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(null),
    }

    mockManager = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
    }

    mockDataSource = {
      transaction: vi.fn().mockImplementation((cb) => cb(mockManager)),
      getRepository: vi.fn().mockReturnValue({
        findOne: vi.fn(),
        save: vi.fn(),
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile()

    service = module.get<AppointmentService>(AppointmentService)
  })

  it('deve criar um agendamento com sucesso', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([
      { weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }
    ])
    mockManager.create.mockReturnValueOnce({ id: 1, status: 'scheduled' })
    mockManager.save.mockResolvedValueOnce({ id: 1, status: 'scheduled' })

    const dto = { doctorId: 1, patientId: 1, startsAt: '2026-11-03T08:00:00-03:00' }
    const result = await service.create(dto)
    
    expect(result.id).toBe(1)
  })

  it('deve falhar se o médico não existir', async () => {
    mockManager.findOne.mockResolvedValueOnce(null)
    await expect(service.create({ doctorId: 99, patientId: 1, startsAt: '2026-11-03T08:00:00-03:00' })).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })

  it('deve falhar se o paciente não existir', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 })
    mockManager.findOne.mockResolvedValueOnce(null)
    await expect(service.create({ doctorId: 1, patientId: 99, startsAt: '2026-11-03T08:00:00-03:00' })).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })

  it('deve falhar se não houver turno para o dia', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 })
    mockManager.findOne.mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([])
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T08:00:00-03:00' })).rejects.toThrow('HORARIO_FORA_DA_ESCALA')
  })

  it('deve falhar se o horário estiver fora do turno', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([{ weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }])
    // Horário 13:00 (fora do turno)
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T13:00:00-03:00' })).rejects.toThrow('HORARIO_FORA_DA_ESCALA')
  })

  it('deve falhar se o horário não estiver alinhado à grade', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([{ weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }])
    // Horário 08:15 (não é múltiplo de 30)
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T08:15:00-03:00' })).rejects.toThrow('HORARIO_FORA_DA_ESCALA')
  })

  it('deve falhar se a consulta não couber no fim do turno', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    // Turno das 08:00 às 11:00 com slot de 45 min.
    mockManager.find.mockResolvedValueOnce([{ weekDay: 2, startTime: '08:00', endTime: '11:00', slotDurationMinutes: 45 }])
    // Horário 11:00 (terminaria às 11:45, passa das 11:00)
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T11:00:00-03:00' })).rejects.toThrow('HORARIO_FORA_DA_ESCALA')
  })

  it('deve falhar se houver conflito de médico', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([{ weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }])
    mockManager.createQueryBuilder().getOne.mockResolvedValueOnce({ id: 1 })
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T08:00:00-03:00' })).rejects.toThrow('HORARIO_INDISPONIVEL')
  })

  it('deve falhar se houver conflito de paciente', async () => {
    mockManager.findOne.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 1 })
    mockManager.find.mockResolvedValueOnce([{ weekDay: 2, startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 }])
    mockManager.createQueryBuilder().getOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 2 })
    await expect(service.create({ doctorId: 1, patientId: 1, startsAt: '2026-11-03T08:00:00-03:00' })).rejects.toThrow('PACIENTE_INDISPONIVEL')
  })

  it('deve atualizar o status do agendamento', async () => {
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, roles: [{ name: 'admin' }] })
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, status: 'scheduled', doctor: { user: { id: 2 } } })
    mockDataSource.getRepository().save.mockResolvedValueOnce({ id: 1, status: 'cancelled' })

    const user = { id: 1, roles: ['admin'] }
    const result = await service.updateStatus(1, 'cancelled' as any, user as any)
    
    expect(result.status).toBe('cancelled')
  })

  it('deve falhar na transição com status inválido', async () => {
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, roles: [{ name: 'admin' }] })
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, status: 'done', doctor: { user: { id: 2 } } })
    
    const user = { id: 1, roles: ['admin'] }
    await expect(service.updateStatus(1, 'scheduled' as any, user as any)).rejects.toThrow('TRANSICAO_INVALIDA')
  })

  it('deve falhar na transição sem permissão', async () => {
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 3, roles: [{ name: 'doctor' }] })
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, status: 'scheduled', doctor: { user: { id: 2 } } })
    
    const user = { id: 3, roles: ['doctor'] }
    await expect(service.updateStatus(1, 'in_progress' as any, user as any)).rejects.toThrow('ACESSO_NEGADO')
  })

  it('deve falhar se o agendamento não existir no updateStatus', async () => {
    mockDataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1, roles: [{ name: 'admin' }] })
    mockDataSource.getRepository().findOne.mockResolvedValueOnce(null)

    const user = { id: 1, roles: ['admin'] }
    await expect(service.updateStatus(99, 'cancelled' as any, user as any)).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })
})