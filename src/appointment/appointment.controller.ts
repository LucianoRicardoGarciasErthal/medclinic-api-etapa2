import { Controller, Post, Body } from '@nestjs/common'

import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { RequireRole } from '../auth/decorator/role.decorator'

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @RequireRole(['admin', 'secretary'])
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto)
  }
}
