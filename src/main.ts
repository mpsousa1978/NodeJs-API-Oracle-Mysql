import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpExceptionFilter } from './commons/filter/http-expection.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {

  // Configuração de certificado
  const privateKeyPath = `${__dirname}/certs/afpesp_org_br.key`;
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const certificate = fs.readFileSync(`${__dirname}/certs/afpesp_org_br.crt`);
  const packcertificate1 = fs.readFileSync(
    `${__dirname}/certs/intermediario.crt`,
  );

  // Inicia o NestJS com Fastify e HTTPS
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(
      {
        https: {
          ca: [packcertificate1],
          key: privateKey,
          cert: certificate,
        },
      }
    ),
  );

  app.enableCors();


  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  //Filtro de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  //Definição da porta  e adaptador de rede
  await app.listen(process.env.PORT, '0.0.0.0');

  console.log('Port:' + process.env.PORT)
}
bootstrap();
