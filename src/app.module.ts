/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DataBaseModule } from './database/database.module';
import { testConnectModule } from './testConnect/testConnect.module';
import { PortariaModule } from './portaria/portaria.modules';

@Module({
  imports: [DataBaseModule, testConnectModule, PortariaModule],
})
export class AppModule { } 
