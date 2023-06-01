import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NAME: z.string().min(3),
  VERSION: z.string(),
  HTTPS_ACTIVE: z.string().transform((value: string): boolean => value === "true"),
  SYSTEM_IDENTIFIER: z.coerce.number(),
  PORT: z.coerce.number().default(3333),

  ORACLE_USER: z.string(),
  ORACLE_PASSWORD: z.string(),
  ORACLE_CONNECT_STRING: z.string(),

  MYSQL_HOST: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  MYSQL_PORT: z.coerce.number(),

  CLOUDWATCH_ARN: z.string(),
  CLOUDWATCH_ACCESS_KEY: z.string(),
  CLOUDWATCH_SECRET: z.string(),
  CLOUDWATCH_AWS_REGION: z.string(),

})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error(
    '⚠️ Variaveis de ambiente invalida.',
    JSON.stringify(_env.error.format(), null, 4),
  )
  process.exit(1)
}

export const env = _env.data
