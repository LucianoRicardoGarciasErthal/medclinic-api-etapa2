import { Exclude } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Role } from '../role/role.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number

  @Column('varchar', { length: 255 })
  name: string

  @Column('varchar', { length: 255, unique: true })
  email: string

  @Exclude() // 
  @Column('varchar', { length: 255, select: false }) // 
  password: string

  @JoinTable()
  @ManyToMany(() => Role, (role: Role) => role.users)
  roles: Role[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}