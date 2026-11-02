import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, expect, beforeEach } from 'vitest'
import { PasswordService } from './password.service'

describe('PasswordService', () => {
  let service: PasswordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile()

    service = module.get<PasswordService>(PasswordService)
  })

  it('deve gerar o hash de uma senha e validar corretamente', async () => {
    const plainPassword = 'senha123'
    const hashed = await service.hash(plainPassword)
    
    expect(hashed).not.toBe(plainPassword)
    
    const isValid = await service.compare(plainPassword, hashed)
    expect(isValid).toBe(true)
  })

  it('deve retornar false ao comparar senha incorreta', async () => {
    const plainPassword = 'senha123'
    const hashed = await service.hash(plainPassword)
    
    const isValid = await service.compare('senha_errada', hashed)
    expect(isValid).toBe(false)
  })
})