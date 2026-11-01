import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../user/user.entity'

export const RoleName = {
  ADMIN: 'admin',
  SECRETARY: 'secretary', // 👈 ADICIONADO
  DOCTOR: 'doctor', // 👈 ADICIONADO
  USER: 'user',
} as const

export type RoleName = (typeof RoleName)[keyof typeof RoleName]

@Entity()
export class Role {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number

  @Index({ unique: true })
  @Column('varchar', { length: 255 })
  name: string

  @ManyToMany(() => User, (user: User) => user.roles)
  users: User[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
