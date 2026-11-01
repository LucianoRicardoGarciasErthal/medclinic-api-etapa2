import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'

import { Doctor } from '../doctor/doctor.entity'
import { Patient } from '../patient/patient.entity'

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient

  @Column({ type: 'timestamptz', name: 'starts_at' })
  startsAt!: Date

  @Column({ type: 'timestamptz', name: 'ends_at' })
  endsAt!: Date

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
