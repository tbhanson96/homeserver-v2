import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api')
  root() {
    return 'sjdfkl';
  }
}
