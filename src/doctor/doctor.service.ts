import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { CreateDoctorDto } from './dto/create-doctor.dto'
import { Doctor } from './doctor.entity'
import { User } from '../user/user.entity'
import { Role } from '../role/role.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class DoctorService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateDoctorDto): Promise<Doctor> {
    // Transação atômica: se algo falhar, nada é salvo no banco
    return this.dataSource.transaction(async (manager) => {
      const userExists = await manager.findOne(User, { where: { email: dto.email } })
      if (userExists) throw new Error('EMAIL_JA_CADASTRADO')

      const crmExists = await manager.findOne(Doctor, { where: { crm: dto.crm } })
      if (crmExists) throw new Error('CRM_JA_CADASTRADO')

      let doctorRole = await manager.findOne(Role, { where: { name: 'doctor' } })
      if (!doctorRole) {
        doctorRole = manager.create(Role, { name: 'doctor' })
        await manager.save(doctorRole)
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10)
      const user = manager.create(User, {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roles: [doctorRole],
      })
      await manager.save(user)

      const doctor = manager.create(Doctor, {
        crm: dto.crm,
        user: user,
      })
      return manager.save(doctor)
    })
  }

  async findAll(): Promise<Doctor[]> {
    return this.dataSource.getRepository(Doctor).find()
  }
}