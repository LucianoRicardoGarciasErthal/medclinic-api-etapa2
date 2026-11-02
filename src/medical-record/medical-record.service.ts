import { Injectable } from '@nestjs/common'
import { DataSource, In } from 'typeorm'

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { MedicalRecord } from './medical-record.entity'
import {
  Appointment,
  AppointmentStatus,
} from '../appointment/appointment.entity'
import { AuthUserDto } from '../auth/dto/auth-user.dto'
import { Doctor } from '../doctor/doctor.entity'
import { Patient } from '../patient/patient.entity'

@Injectable()
export class MedicalRecordService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    patientId: number,
    dto: CreateMedicalRecordDto,
    user: AuthUserDto,
  ) {
    const patient = await this.dataSource
      .getRepository(Patient)
      .findOneBy({ id: patientId })
    if (!patient) throw new Error('RECURSO_NAO_ENCONTRADO')

    const doctor = await this.dataSource.getRepository(Doctor).findOne({
      where: { user: { id: user.id } },
    })
    if (!doctor) throw new Error('ACESSO_NEGADO')

    // Valida Vínculo (RN14)
    const hasLink = await this.dataSource.getRepository(Appointment).findOne({
      where: {
        doctor: { id: doctor.id },
        patient: { id: patientId },
        status: In([AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE]),
      },
    })

    if (!hasLink) throw new Error('ACESSO_NEGADO')

    const record = this.dataSource.getRepository(MedicalRecord).create({
      text: dto.text,
      patient,
      doctor,
    })
    return this.dataSource.getRepository(MedicalRecord).save(record)
  }

  async findByPatient(patientId: number, user: AuthUserDto) {
    const patient = await this.dataSource
      .getRepository(Patient)
      .findOneBy({ id: patientId })
    if (!patient) throw new Error('RECURSO_NAO_ENCONTRADO')

    if (user.roles.includes('admin')) {
      return this.dataSource.getRepository(MedicalRecord).find({
        where: { patient: { id: patientId } },
        order: { createdAt: 'DESC' },
      })
    }

    const doctor = await this.dataSource.getRepository(Doctor).findOne({
      where: { user: { id: user.id } },
    })
    if (!doctor) throw new Error('ACESSO_NEGADO')

    const hasLink = await this.dataSource.getRepository(Appointment).findOne({
      where: {
        doctor: { id: doctor.id },
        patient: { id: patientId },
        status: In([AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE]),
      },
    })

    if (!hasLink) throw new Error('ACESSO_NEGADO')

    return this.dataSource.getRepository(MedicalRecord).find({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
    })
  }
}
