import { AuthUserDto } from '../auth/dto/auth-user.dto'

import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { Appointment, AppointmentStatus } from './appointment.entity'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { Doctor } from '../doctor/doctor.entity'
import { WorkShift } from '../doctor/work-shift.entity'
import { Patient } from '../patient/patient.entity'
import { User } from '../user/user.entity' // 👈 Import adicionado

@Injectable()
export class AppointmentService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const startsAt = new Date(dto.startsAt)

    return this.dataSource.transaction(async (manager) => {
      // LOCK PESSIMISTA
      const doctor = await manager.findOne(Doctor, {
        where: { id: dto.doctorId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      })
      if (!doctor) throw new Error('RECURSO_NAO_ENCONTRADO')

      const patient = await manager.findOne(Patient, {
        where: { id: dto.patientId },
      })
      if (!patient) throw new Error('RECURSO_NAO_ENCONTRADO')

      // Ajusta o fuso horário
      const localStart = new Date(
        startsAt.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
      )
      const weekDay = localStart.getDay()
      const currentMinutes =
        localStart.getHours() * 60 + localStart.getMinutes()

      const shifts = await manager.find(WorkShift, {
        where: { doctor: { id: dto.doctorId }, weekDay },
      })

      let validShift: WorkShift | null = null
      for (const shift of shifts) {
        const [startH, startM] = shift.startTime.split(':').map(Number)
        const [endH, endM] = shift.endTime.split(':').map(Number)
        const shiftStartMinutes = startH * 60 + startM
        const shiftEndMinutes = endH * 60 + endM

        if (
          currentMinutes >= shiftStartMinutes &&
          currentMinutes < shiftEndMinutes &&
          (currentMinutes - shiftStartMinutes) % shift.slotDurationMinutes === 0
        ) {
          if (currentMinutes + shift.slotDurationMinutes <= shiftEndMinutes) {
            validShift = shift
            break
          }
        }
      }

      if (!validShift) throw new Error('HORARIO_FORA_DA_ESCALA')

      const endsAt = new Date(
        startsAt.getTime() + validShift.slotDurationMinutes * 60000,
      )

      // Conflito do Médico
      const doctorConflict = await manager
        .createQueryBuilder(Appointment, 'app')
        .where('app.doctor_id = :doctorId', { doctorId: dto.doctorId })
        .andWhere('app.status != :status', {
          status: AppointmentStatus.CANCELLED,
        })
        .andWhere('app.starts_at < :endsAt AND app.ends_at > :startsAt', {
          startsAt,
          endsAt,
        })
        .getOne()

      if (doctorConflict) throw new Error('HORARIO_INDISPONIVEL')

      // Conflito do Paciente
      const patientConflict = await manager
        .createQueryBuilder(Appointment, 'app')
        .where('app.patient_id = :patientId', { patientId: dto.patientId })
        .andWhere('app.status != :status', {
          status: AppointmentStatus.CANCELLED,
        })
        .andWhere('app.starts_at < :endsAt AND app.ends_at > :startsAt', {
          startsAt,
          endsAt,
        })
        .getOne()

      if (patientConflict) throw new Error('PACIENTE_INDISPONIVEL')

      const appointment = manager.create(Appointment, {
        doctor,
        patient,
        startsAt,
        endsAt,
        status: AppointmentStatus.SCHEDULED,
      })
      return manager.save(appointment)
    })
  }

  async updateStatus(id: number, newStatus: AppointmentStatus, user: AuthUserDto) {
    // 1. Busca o usuário no banco para garantir as roles corretas
    const dbUser = await this.dataSource.getRepository(User).findOne({
      where: { id: user.id },
      relations: { roles: true },
    })
    if (!dbUser) throw new Error('ACESSO_NEGADO')

    const userRoles = dbUser.roles.map((r) => r.name)

    // 2. Busca a consulta com as relações do médico carregadas
    const appointment = await this.dataSource.getRepository(Appointment).findOne({
      where: { id },
      relations: { doctor: { user: true } },
    })
    if (!appointment) throw new Error('RECURSO_NAO_ENCONTRADO')

    // 3. Valida a transição
    const allowedRoles: Record<string, Record<string, string[]>> = {
      scheduled: {
        in_progress: ['admin', 'doctor'],
        cancelled: ['admin', 'secretary', 'doctor'],
      },
      in_progress: {
        done: ['admin', 'doctor'],
        cancelled: ['admin', 'doctor'],
      },
      done: {},
      cancelled: {},
    }

    const rolesForTransition = allowedRoles[appointment.status]?.[newStatus]
    if (!rolesForTransition) throw new Error('TRANSICAO_INVALIDA')

    // 4. Valida a permissão
    const isAdmin = userRoles.includes('admin')
    const isSecretary = userRoles.includes('secretary')
    const isDoctorOfAppointment =
      userRoles.includes('doctor') && appointment.doctor.user.id === user.id

    const hasPermission =
      (isAdmin && rolesForTransition.includes('admin')) ||
      (isSecretary && rolesForTransition.includes('secretary')) ||
      (isDoctorOfAppointment && rolesForTransition.includes('doctor'))

    if (!hasPermission) throw new Error('ACESSO_NEGADO')

    // 5. Atualiza e salva
    appointment.status = newStatus
    return this.dataSource.getRepository(Appointment).save(appointment)
  }
}