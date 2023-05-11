/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/database/database.module';
import { TestConnectController } from './testConnect.controller';
import { TestConnectService } from './testConnect.service';


@Module({
  imports: [DataBaseModule],
  controllers: [TestConnectController],
  providers: [TestConnectService],
  exports: [TestConnectService],
})
export class testConnectModule { }
