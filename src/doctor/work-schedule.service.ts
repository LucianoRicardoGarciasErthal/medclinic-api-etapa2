import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { WorkShift } from './work-shift.entity'
import { UpdateWorkScheduleDto, ShiftDto } from './dto/update-work-schedule.dto'
import { Doctor } from './doctor.entity'

@Injectable()
export class WorkScheduleService {
  constructor(private readonly dataSource: DataSource) {}

  async replaceSchedule(doctorId: number, dto: UpdateWorkScheduleDto) {
    const doctor = await this.dataSource.getRepository(Doctor).findOneBy({ id: doctorId })
    if (!doctor) throw new Error('RECURSO_NAO_ENCONTRADO')

    this.validateOverlap(dto.shifts)

    // Salva a nova escala apagando a antiga (Transação)
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(WorkShift, { doctor: { id: doctorId } })

      const newShifts = dto.shifts.map((shift) =>
        manager.create(WorkShift, { ...shift, doctor })
      )
      await manager.save(newShifts)

      return { shifts: dto.shifts }
    })
  }

  async findByDoctor(doctorId: number) {
    const doctor = await this.dataSource.getRepository(Doctor).findOneBy({ id: doctorId })
    if (!doctor) throw new Error('RECURSO_NAO_ENCONTRADO')

    const shifts = await this.dataSource.getRepository(WorkShift).find({
      where: { doctor: { id: doctorId } },
    })
    return { shifts }
  }

  private validateOverlap(shifts: ShiftDto[]) {
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const a = shifts[i]
        const b = shifts[j]

        if (a.weekDay !== b.weekDay) continue

        // Lógica de Sobreposição: A.inicio < B.fim && B.inicio < A.fim
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          throw new Error('DADOS_INVALIDOS')
        }
      }
    }
  }
}