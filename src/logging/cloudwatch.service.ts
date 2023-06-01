import { Injectable } from "@nestjs/common";
import { CloudWatchLogsClient, DescribeLogGroupsCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { cloudWatchClient } from "./lib/cloudWatchClient";
import { LogMessageDTO } from "@src/logging/dto/logMessage.dto";
import { LoggingService } from '@src/logging/logging.service';

@Injectable()
export class CloudWatchService {
  private clientCloudWatch: CloudWatchLogsClient;
  private readonly log: LoggingService

  constructor() {
    this.clientCloudWatch = cloudWatchClient;
  }

  async putLogEvents(logGroupName: string, logStreamName: string, messages: LogMessageDTO[]): Promise<void> {
    // Invoca o método para enviar os logs para o CloudWatch
    // Removido try-catch; deixe o erro propagar para o LoggingService
    await this.sendLogEvents(logGroupName, logStreamName, messages);
  }

  // método privado para enviar os logs para o CloudWatch
  private async sendLogEvents(logGroupName: string, logStreamName: string, messages: LogMessageDTO[]): Promise<void> {
    const logEvents = messages.map(message => ({
      message: JSON.stringify(message),
      timestamp: Date.now(),
    }));

    const params = {
      logEvents,
      logGroupName,
      logStreamName,
    };
    await this.clientCloudWatch.send(new PutLogEventsCommand(params));
  }


  // Método para verificar o status do CloudWatch
  async checkStatus(): Promise<boolean> {
    try {
      // Tente listar grupos de logs como uma operação simples para verificar a saúde do CloudWatch
      await this.clientCloudWatch.send(new DescribeLogGroupsCommand({}));
      return true;
    } catch (error) {
      this.log.logError('[CLOUDWATCH] Encontramos dificuldades em verificar o status do CloudWatch.', { sendSNS: false, data: error });
      return false;
    }
  }
}