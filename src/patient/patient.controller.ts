import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common'

import { CreatePatientDto } from './dto/create-patient.dto'
import { PatientService } from './patient.service'

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  async create(@Body() dto: CreatePatientDto) {
    return this.patientService.create(dto)
  }

  @Get()
  async findAll() {
    return this.patientService.findAll()
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.findById(id)
  }
}
