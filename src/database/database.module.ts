/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { MysqlService } from './mysql.service';


@Module({
  imports: [],
  providers: [OracleService, MysqlService],
  exports: [OracleService, MysqlService],
})
export class DataBaseModule { }
