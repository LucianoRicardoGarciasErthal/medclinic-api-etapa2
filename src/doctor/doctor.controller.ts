import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common'

import { DoctorService } from './doctor.service'
import { CreateDoctorDto } from './dto/create-doctor.dto'
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto' // 👈 Importa o DTO da escala
import { WorkScheduleService } from './work-schedule.service' // 👈 Importa o service da escala
import { RequireRole } from '../auth/decorator/role.decorator'

@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly workScheduleService: WorkScheduleService, // 👈 Injeta o service da escala
  ) {}

  @Post()
  @RequireRole(['admin'])
  async create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto)
  }

  @Get()
  async findAll() {
    return this.doctorService.findAll()
  }

  // ⚠️ ROTAS DA ESCALA ADICIONADAS AQUI
  @Put(':doctorId/work-schedule')
  @RequireRole(['admin'])
  async updateSchedule(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: UpdateWorkScheduleDto,
  ) {
    return this.workScheduleService.replaceSchedule(doctorId, dto)
  }

  @Get(':doctorId/work-schedule')
  async getSchedule(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.workScheduleService.findByDoctor(doctorId)
  }
}
