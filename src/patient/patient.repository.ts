import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { Patient } from './patient.entity'

@Injectable()
export class PatientRepository extends Repository<Patient> {
  constructor(private readonly dataSource: DataSource) {
    super(Patient, dataSource.createEntityManager())
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    return this.findOne({ where: { cpf } })
  }
}
