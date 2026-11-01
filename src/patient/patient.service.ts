import { Injectable } from '@nestjs/common'

import { CreatePatientDto } from './dto/create-patient.dto'
import { Patient } from './patient.entity'
import { PatientRepository } from './patient.repository'

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientRepository.findByCpf(dto.cpf)
    if (existing) {
      throw new Error('CPF_JA_CADASTRADO')
    }

    // ⚠️ Separando a criação do objeto da gravação para evitar erro de tipagem
    const patient = this.patientRepository.create(dto)
    return this.patientRepository.save(patient)
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find()
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOneBy({ id })
    if (!patient) {
      throw new Error('RECURSO_NAO_ENCONTRADO')
    }
    return patient
  }
}
