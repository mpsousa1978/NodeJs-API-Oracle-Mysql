import { BaseMessage } from "./BaseMessage";

export class LogMessageDTO extends BaseMessage {
  description: string;
  data: object;
  logGroupName: string;
  logStreamName: string;
}