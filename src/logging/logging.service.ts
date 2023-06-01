import { Injectable, Logger } from "@nestjs/common";
import { LogMessageDTO } from "./dto/logMessage.dto";
import { env } from '@src/commons/utils/readEnv';
import { CloudWatchService } from "./cloudwatch.service";



@Injectable()
export class LoggingService {

  private logger = new Logger(LoggingService.name);

  constructor(
    private readonly cloudWatchService: CloudWatchService,
  ) { }


  async logInfo(description: string, options?: { data?: any, sendSNS?: boolean, logGroupName?: string, logStreamName?: string }): Promise<void> {
    const logMessage = new LogMessageDTO();
    logMessage.application = env.NAME;
    logMessage.logLevel = 'INFO';
    logMessage.date = new Date().toLocaleString('pt-BR');
    logMessage.description = description;

    if (options && options.data !== undefined) {
      logMessage.data = options.data;
    }

    logMessage.application = env.NAME;
    this.logLocal(logMessage);
    if (options && options.sendSNS) {
      if (!options.logGroupName || !options.logStreamName) {
        throw new Error('logGroupName and logStreamName are required when sendSNS is true');
      }
      this.logCloudWatch(options.logGroupName, options.logStreamName, [logMessage]);
    }

  }

  async logError(description: string, options?: { data?: any, sendSNS?: boolean, logGroupName?: string, logStreamName?: string }): Promise<void> {
    const logMessage = new LogMessageDTO();
    logMessage.application = env.NAME;
    logMessage.logLevel = 'ERROR';
    logMessage.date = new Date().toLocaleString('pt-BR');
    logMessage.description = description;

    if (options && options.data !== undefined) {
      logMessage.data = options.data;
    }

    this.logLocal(logMessage);

    if (options && options.sendSNS) {
      if (!options.logGroupName || !options.logStreamName) {
        throw new Error('logGroupName and logStreamName are required when sendSNS is true');
      }
      this.logCloudWatch(options.logGroupName, options.logStreamName, [logMessage]);
    }

  }


  private async logCloudWatch(logGroupName: string, logStreamName: string, messages: LogMessageDTO[]): Promise<void> {
    try {
      await this.cloudWatchService.putLogEvents(logGroupName, logStreamName, messages);
    } catch (error) {
      this.logger.error(`[CLOUDWATCH] Encontramos problemas ao enviar logs para o CloudWatch: ${error}`);
    }
  }

  private logLocal(message: LogMessageDTO): void {
    if (message.logLevel === "ERROR") {
      this.logger.error(JSON.stringify(message));
    } else {
      this.logger.log(JSON.stringify(message));
    }
  }

}