import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PatientService } from './patient.service'
import { PatientRepository } from './patient.repository'

describe('PatientService', () => {
  let service: PatientService
  let repo: PatientRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PatientRepository,
          useValue: {
            findByCpf: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PatientService>(PatientService)
    repo = module.get<PatientRepository>(PatientRepository)
  })

  it('deve criar um paciente com sucesso', async () => {
    vi.spyOn(repo, 'findByCpf').mockResolvedValue(null)
    vi.spyOn(repo, 'create').mockReturnValue({ name: 'Carlos', cpf: '12345678901' } as any)
    vi.spyOn(repo, 'save').mockResolvedValue({ id: 1, name: 'Carlos', cpf: '12345678901' } as any)

    const result = await service.create({ name: 'Carlos', cpf: '12345678901' })
    expect(result.id).toBe(1)
    expect(repo.save).toHaveBeenCalled()
  })

  it('deve lançar erro se o CPF já existir', async () => {
    vi.spyOn(repo, 'findByCpf').mockResolvedValue({ id: 1 } as any)

    await expect(service.create({ name: 'Carlos', cpf: '12345678901' })).rejects.toThrow('CPF_JA_CADASTRADO')
  })

  it('deve buscar um paciente por ID com sucesso', async () => {
    vi.spyOn(repo, 'findOneBy').mockResolvedValue({ id: 1, name: 'Carlos' } as any)
    
    const result = await service.findById(1)
    expect(result.id).toBe(1)
  })

  it('deve lançar erro se o paciente não for encontrado pelo ID', async () => {
    vi.spyOn(repo, 'findOneBy').mockResolvedValue(null)
    
    await expect(service.findById(99)).rejects.toThrow('RECURSO_NAO_ENCONTRADO')
  })
})