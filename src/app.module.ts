import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { DatabaseModule } from './@common/database/database.module'
import { AuthModule } from './auth/auth.module'
import { JwtGuard } from './auth/jwt.guard'
import { validateEnv } from './env'
import { HealthController } from './health.controller'
import { PatientModule } from './patient/patient.module'
import { UserModule } from './user/user.module'
import { DoctorModule } from './doctor/doctor.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    PatientModule,
    DoctorModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
