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

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient

  @Column({ type: 'text' })
  text!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
