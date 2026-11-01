import 'dotenv/config'
import { FactoryProvider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

import { SnakeCaseNamingStrategy } from './snake-case-naming-pattern'
import { Appointment } from '../../appointment/appointment.entity'
import { Doctor } from '../../doctor/doctor.entity'
import { WorkShift } from '../../doctor/work-shift.entity'
import { APIEnv } from '../../env'
import { Patient } from '../../patient/patient.entity'
import { Role } from '../../role/role.entity'
import { User } from '../../user/user.entity'

export const ENTITIES = [Role, User, Patient, Doctor, WorkShift, Appointment]

export const databaseProvider: FactoryProvider = {
  provide: DataSource,
  async useFactory(configService: ConfigService<APIEnv>) {
    const AppDataSource = new DataSource({
      type: 'postgres',
      ssl: configService.getOrThrow('DB_SSL'),
      host: configService.getOrThrow('DB_HOST'),
      port: Number(configService.getOrThrow('DB_PORT')),
      username: configService.getOrThrow('DB_USER'),
      password: configService.getOrThrow('DB_PASSWORD'),
      database: configService.getOrThrow('DB_NAME'),
      poolSize: 10,
      synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
      logging: configService.getOrThrow('DB_LOG_LEVEL'),
      entities: ENTITIES,
      namingStrategy: new SnakeCaseNamingStrategy(),
      migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
      invalidWhereValuesBehavior: { undefined: 'ignore', null: 'sql-null' },
    })

    await AppDataSource.initialize()

    await AppDataSource.runMigrations({
      transaction: 'each',
    })
    return AppDataSource
  },
  inject: [ConfigService],
}
