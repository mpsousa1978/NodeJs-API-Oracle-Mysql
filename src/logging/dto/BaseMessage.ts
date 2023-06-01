export abstract class BaseMessage {
  application: string;
  logLevel: "ERROR" | "INFO";
  date: string;
}