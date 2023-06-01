/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { MysqlService } from "src/database/mysql.service";
import { OracleService } from "src/database/oracle.service";

@Injectable()
export class SensorService {
  constructor(
    private readonly oracleService: OracleService,
    private readonly mySqlService: MysqlService,
  ) { }

  async getStatus() {
    const oracledbStatus = await this.oracleService.checkStatus();
    const mySqlStatus = await this.mySqlService.checkStatus();

    return {
      oracledb: oracledbStatus,
      mySql: mySqlStatus
    };
  }
}