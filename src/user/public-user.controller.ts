import { Body, Controller, Post } from '@nestjs/common'

import { LoginDto } from './dtos/login.dto'
import { UserService } from './user.service'
import { PublicRoute } from '../auth/decorator/public-route.decorator'

@PublicRoute()
@Controller('users')
export class PublicUserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.userService.login(dto)
    // ⚠️ Converte "jwt" para "accessToken" para atender ao contrato
    return { accessToken: result.jwt }
  }
}
