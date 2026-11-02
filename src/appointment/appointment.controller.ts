import { Controller, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { RequireRole } from '../auth/decorator/role.decorator'
import { GetAuthUser } from '../auth/decorator/get-auth-user.decorator'
import { AuthUserDto } from '../auth/dto/auth-user.dto'

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @RequireRole(['admin', 'secretary'])
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto)
  }

  // ⚠️ ESTA É A ROTA QUE ESTAVA FALTANDO
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @GetAuthUser() user: AuthUserDto,
  ) {
    return this.appointmentService.updateStatus(id, dto.status, user)
  }
}