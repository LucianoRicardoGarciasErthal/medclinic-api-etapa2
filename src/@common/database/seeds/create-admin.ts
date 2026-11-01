import { NestFactory } from '@nestjs/core'
import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'

import { AppModule } from '../../../app.module'
import { Role } from '../../../role/role.entity'
import { User } from '../../../user/user.entity'

async function seed() {
  // Inicia o contexto do NestJS (carrega o .env e o DataSource)
  const app = await NestFactory.createApplicationContext(AppModule)
  const dataSource = app.get(DataSource)

  const userRepo = dataSource.getRepository(User)
  const roleRepo = dataSource.getRepository(Role)

  const email = 'admin@medclinic.com'
  const password = 'SenhaForte@123'

  const existing = await userRepo.findOne({ where: { email } })
  if (existing) {
    console.log('✅ Admin já existe no banco.')
    await app.close()
    process.exit(0)
  }

  let adminRole = await roleRepo.findOne({ where: { name: 'admin' } })
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin' })
    await roleRepo.save(adminRole)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = userRepo.create({
    name: 'Administrador',
    email: email,
    password: hashedPassword,
    roles: [adminRole],
  })

  await userRepo.save(user)
  console.log('✅ Admin criado com sucesso!')
  console.log('E-mail:', email)
  console.log('Senha:', password)

  await app.close()
  process.exit(0)
}

seed().catch((err: unknown) => {
  console.error('Erro ao criar admin:', err)
  process.exit(1)
})
