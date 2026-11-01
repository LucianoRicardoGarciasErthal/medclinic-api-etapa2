import { Module } from '@nestjs/common'

import { DoctorController } from './doctor.controller'
import { DoctorService } from './doctor.service'
import { WorkScheduleService } from './work-schedule.service'

@Module({
  controllers: [DoctorController],
  providers: [DoctorService, WorkScheduleService],
})
export class DoctorModule {}
