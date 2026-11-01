import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'

import { Doctor } from './doctor.entity'

@Entity('work_shifts')
export class WorkShift {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor

  @Column({ type: 'int', name: 'week_day' })
  weekDay!: number // 0 (Domingo) a 6 (Sábado)

  @Column({ length: 5, name: 'start_time' })
  startTime!: string // Formato HH:MM

  @Column({ length: 5, name: 'end_time' })
  endTime!: string // Formato HH:MM

  @Column({ type: 'int', name: 'slot_duration_minutes' })
  slotDurationMinutes!: number
}
