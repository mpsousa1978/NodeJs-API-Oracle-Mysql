/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller, Get } from "@nestjs/common";

import { TestConnectService } from './testConnect.service';

@Controller('testConnect')
export class TestConnectController {

  constructor(private readonly TestConnectService: TestConnectService) { }

  @Get("status")
  async getStatus() {
    return await this.TestConnectService.getStatus();
  }

}