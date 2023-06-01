/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DataBaseModule } from './database/database.module';
import { SensorModule } from './sensor/sensor.module';
import { PortariaModule } from './portaria/portaria.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [DataBaseModule, SensorModule, PortariaModule, LoggingModule],
})
export class AppModule { }  
