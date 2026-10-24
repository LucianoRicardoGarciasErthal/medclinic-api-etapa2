import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService: ConfigService = app.get(ConfigService)
  const port = configService.getOrThrow('PORT')

  // ⚠️ Adiciona o prefixo global
  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // ⚠️ Adiciona 0.0.0.0 para funcionar no Render/Cloud Run depois
  await app.listen(port, '0.0.0.0')
  console.log(`Listening on port ${port.toString()}`)
}

bootstrap().catch((err: unknown) => {
  console.error(err)
  process.exit(-1)
})