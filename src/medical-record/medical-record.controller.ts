import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common'

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { MedicalRecordService } from './medical-record.service'
import { GetAuthUser } from '../auth/decorator/get-auth-user.decorator'
import { RequireRole } from '../auth/decorator/role.decorator'
import { AuthUserDto } from '../auth/dto/auth-user.dto'

@Controller('patients/:patientId/medical-records')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @RequireRole(['doctor'])
  async create(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: CreateMedicalRecordDto,
    @GetAuthUser() user: AuthUserDto,
  ) {
    return this.medicalRecordService.create(patientId, dto, user)
  }

  @Get()
  @RequireRole(['doctor', 'admin'])
  async findByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @GetAuthUser() user: AuthUserDto,
  ) {
    return this.medicalRecordService.findByPatient(patientId, user)
  }
}
