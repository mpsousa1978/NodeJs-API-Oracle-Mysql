/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller, Get } from "@nestjs/common";

import { SensorService } from './sensor.service';

@Controller('sensor')
export class SensorController {

  constructor(private readonly SensorService: SensorService) { }

  @Get("status")
  async getStatus() {
    console.log("veio");
    return await this.SensorService.getStatus();
  }

}