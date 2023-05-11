import { Module } from '@nestjs/common';
import { DataBaseModule } from "src/database/database.module";
import { PortariaServices } from "./portaria.services";
import { PortariaController } from "./portaria.controller";

@Module({
  imports: [DataBaseModule],
  controllers: [PortariaController],
  providers: [PortariaServices],
  exports: [PortariaServices],
})
export class PortariaModule { }
