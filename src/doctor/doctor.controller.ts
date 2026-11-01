import { Controller, Get, Post, Body } from '@nestjs/common'
import { DoctorService } from './doctor.service'
import { CreateDoctorDto } from './dto/create-doctor.dto'
import { RequireRole } from '../auth/decorator/role.decorator' // 👈 Importa o decorator correto

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @RequireRole(['admin']) // 👈 Passa como um array
  async create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto)
  }

  @Get()
  async findAll() {
    return this.doctorService.findAll()
  }
}