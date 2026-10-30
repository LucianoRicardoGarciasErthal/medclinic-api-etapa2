import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 100 })
  name!: string

  @Column({ length: 11, unique: true })
  cpf!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
