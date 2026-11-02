import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { JWT_GUARD_AUTH_REQ_KEY } from '../jwt.guard'
import { AuthUserDto } from '../dto/auth-user.dto'

export const GetAuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    // Pega o payload salvo pelo JwtGuard
    const payload = (request as any)[JWT_GUARD_AUTH_REQ_KEY]
    
    // O AuthUserDto está dentro da propriedade 'data' do payload
    return payload?.data as AuthUserDto
  },
)