import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MedicalRecordService } from './medical-record.service'
import { DataSource } from 'typeorm'

describe('MedicalRecordService', () => {
  let service: MedicalRecordService
  let dataSource: any

  beforeEach(async () => {
    dataSource = {
      getRepository: vi.fn().mockReturnValue({
        findOneBy: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        find: vi.fn(),
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile()

    service = module.get<MedicalRecordService>(MedicalRecordService)
  })

  it('deve impedir escrita se o médico não tiver vínculo', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    dataSource.getRepository().findOne.mockResolvedValueOnce({ id: 1 })
    dataSource.getRepository().findOne.mockResolvedValueOnce(null)

    const user = { id: 1, roles: ['doctor'] }
    await expect(service.create(1, { text: 'Teste' }, user as any)).rejects.toThrow('ACESSO_NEGADO')
  })

  it('deve criar um prontuário se o médico tiver vínculo', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    dataSource.getRepository().findOne.mockResolvedValue({ id: 1 })
    dataSource.getRepository().create.mockReturnValue({ id: 1, text: 'Teste' })
    dataSource.getRepository().save.mockResolvedValue({ id: 1, text: 'Teste' })

    const user = { id: 1, roles: ['doctor'] }
    const result = await service.create(1, { text: 'Teste' }, user as any)
    
    expect(result.id).toBe(1)
  })

  it('deve listar prontuários se o usuário for admin', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    dataSource.getRepository().find.mockResolvedValue([{ id: 1, text: 'Teste' }])

    const user = { id: 2, roles: ['admin'] }
    const result = await service.findByPatient(1, user as any)
    
    expect(result.length).toBe(1)
  })

  it('deve listar prontuários se o médico tiver vínculo', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValue({ id: 1 })
    dataSource.getRepository().findOne.mockResolvedValue({ id: 1 })
    dataSource.getRepository().find.mockResolvedValue([{ id: 1, text: 'Teste' }])

    const user = { id: 1, roles: ['doctor'] }
    const result = await service.findByPatient(1, user as any)
    
    expect(result.length).toBe(1)
  })

  it('deve falhar se o paciente não existir', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValueOnce(null)
    const user = { id: 1, roles: ['doctor'] }
    await expect(service.create(99, { text: 'Teste' }, user as any)).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })

  it('deve falhar se a secretária tentar ler', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValueOnce({ id: 1 })
    const user = { id: 3, roles: ['secretary'] }
    await expect(service.findByPatient(1, user as any)).rejects.toThrow('ACESSO_NEGADO')
  })

  // 👇 O TESTE QUE VOCÊ PEDIU PARA INCLUIR
  it('deve falhar ao criar prontuário se o paciente não existir', async () => {
    dataSource.getRepository().findOneBy.mockResolvedValueOnce(null)
    const user = { id: 1, roles: ['doctor'] }
    await expect(service.create(99, { text: 'Teste' }, user as any)).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })
})