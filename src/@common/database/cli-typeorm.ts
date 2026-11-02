import 'dotenv/config'; // Garante que o .env será lido
import { DataSource } from 'typeorm';
import { SnakeCaseNamingStrategy } from './snake-case-naming-pattern';
import { ENTITIES } from './typeorm'; // Reutiliza a lista de entidades

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ⚠️ A CORREÇÃO DO SSL AQUI TAMBÉM:
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ENTITIES,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  namingStrategy: new SnakeCaseNamingStrategy(),
  synchronize: false,
  logging: process.env.DB_LOG_LEVEL as any,
});