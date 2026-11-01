import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'

import { User } from '../user/user.entity'

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 50, unique: true })
  crm!: string

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
