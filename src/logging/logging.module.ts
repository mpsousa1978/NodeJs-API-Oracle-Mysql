import { Module, } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { CloudWatchService } from './cloudwatch.service';



@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
      ),
      transports: [
        new DailyRotateFile({
          level: 'error',
          filename: 'logs/error-%DATE%.log',
          datePattern: 'DD-MM-YYYY',
          maxSize: '5m',
          maxFiles: '30d',
          zippedArchive: true,
          auditFile: null,
        }),
        new DailyRotateFile({
          level: 'info',
          filename: 'logs/log-%DATE%.log',
          datePattern: 'DD-MM-YYYY',
          maxSize: '5m', // Tamanho máximo do arquivo
          maxFiles: '30d', // Quantidade máxima de arquivos a serem mantidos (30 dias)
          zippedArchive: true,
          auditFile: null, // Desativa a criação de arquivos de auditoria
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
          ),
        }),
      ],
    }),
  ],
  providers: [LoggingService, CloudWatchService],
  exports: [LoggingService, CloudWatchService],
})
export class LoggingModule { }