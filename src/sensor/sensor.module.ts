/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/database/database.module';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';


@Module({
  imports: [DataBaseModule],
  controllers: [SensorController],
  providers: [SensorService],
  exports: [SensorService],
})
export class SensorModule { }
