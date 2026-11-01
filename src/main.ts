import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { APIEnv } from './env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ⚠️ Tipando o ConfigService para evitar o erro de "any"
  const configService = app.get<ConfigService<APIEnv>>(ConfigService)
  const port = configService.getOrThrow<number>('PORT')

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  await app.listen(port, '0.0.0.0')
  console.log(`Listening on port ${port.toString()}`)
}

bootstrap().catch((err: unknown) => {
  console.error(err)
  process.exit(-1)
})
