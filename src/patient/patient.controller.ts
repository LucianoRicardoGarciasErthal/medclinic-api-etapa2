import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common'
import { PatientService } from './patient.service'
import { CreatePatientDto } from './dto/create-patient.dto'

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