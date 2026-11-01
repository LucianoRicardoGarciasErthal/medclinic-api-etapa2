import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { Appointment, AppointmentStatus } from './appointment.entity'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { Doctor } from '../doctor/doctor.entity'
import { WorkShift } from '../doctor/work-shift.entity'
import { Patient } from '../patient/patient.entity'

@Injectable()
export class AppointmentService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const startsAt = new Date(dto.startsAt)

    return this.dataSource.transaction(async (manager) => {
      // ⚠️ LOCK PESSIMISTA COM CORREÇÃO DO JOIN
      const doctor = await manager.findOne(Doctor, {
        where: { id: dto.doctorId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false, // 👈 A CORREÇÃO ESTÁ AQUI
      })
      if (!doctor) throw new Error('RECURSO_NAO_ENCONTRADO')

      const patient = await manager.findOne(Patient, {
        where: { id: dto.patientId },
      })
      if (!patient) throw new Error('RECURSO_NAO_ENCONTRADO')

      // Ajusta o fuso horário para America/Sao_Paulo
      const localStart = new Date(
        startsAt.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
      )
      const weekDay = localStart.getDay()
      const currentMinutes =
        localStart.getHours() * 60 + localStart.getMinutes()

      // Busca os turnos do médico para o dia
      const shifts = await manager.find(WorkShift, {
        where: { doctor: { id: dto.doctorId }, weekDay },
      })

      let validShift: WorkShift | null = null
      for (const shift of shifts) {
        const [startH, startM] = shift.startTime.split(':').map(Number)
        const [endH, endM] = shift.endTime.split(':').map(Number)
        const shiftStartMinutes = startH * 60 + startM
        const shiftEndMinutes = endH * 60 + endM

        // Valida se o horário cai dentro do turno e se está alinhado à grade
        if (
          currentMinutes >= shiftStartMinutes &&
          currentMinutes < shiftEndMinutes &&
          (currentMinutes - shiftStartMinutes) % shift.slotDurationMinutes === 0
        ) {
          // Valida se a consulta inteira cabe no turno
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

      // Valida conflito do Médico (RN08)
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

      // Valida conflito do Paciente (RN09)
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
}
