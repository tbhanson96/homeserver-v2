import { Controller, Post, Body, Get, UseGuards, Logger, Query, BadRequestException } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/apikey.guard';
import { JwtGuard } from '../auth/jwt.guard';
import { HealthDataDto, SleepDataDto } from '../models/healthData.dto';
import { HealthService } from './health.service';
import { RawHealthData } from '../models/rawHealthData';

@Controller(joinRoutes(routes.api, routes.health))
export class HealthController {

    constructor(
      private readonly healthService: HealthService,
      private readonly logger: Logger
    ) { }

    @Post()
    @ApiCreatedResponse({ description: 'Succesfully uploaded health data'})
    @ApiBody({ type: Object })
    @UseGuards(ApiKeyGuard)
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async importHealthData(@Body() healthData: RawHealthData) {
      await this.healthService.importHealthData(healthData);
    }

    @Post('sleep')
    @ApiCreatedResponse({ description: 'Succesfully uploaded health data'})
    @ApiBody({ type: Object })
    @UseGuards(ApiKeyGuard)
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async importSleepData(@Body() healthData: any) {
      await this.healthService.importSleepData(healthData);
    }

    @Get()
    @UseGuards(JwtGuard)
    @ApiOkResponse({ description: 'success', type: HealthDataDto })
    @ApiQuery({ name: 'from', type: Date})
    @ApiQuery({ name: 'to', type: Date})
    @ApiQuery({ name: 'metrics', type: String, isArray: true })
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async getHealthData(
      @Query('from') from: Date,
      @Query('to') to: Date,
      @Query('metrics') metrics: string[],
    ) {
      // Fix bug with query string arrays.
      if (typeof metrics === 'string') {
        metrics = [metrics]
      }
      return await this.healthService.getHealthData(from, to, metrics);
    }

    @Get('sleep')
    @UseGuards(JwtGuard)
    @ApiOkResponse({ description: 'success', type: SleepDataDto})
    @ApiQuery({ name: 'from', type: Date})
    @ApiQuery({ name: 'to', type: Date})
    @ApiUnauthorizedResponse({ description: 'Failed to login' })
    async getSleepData(
      @Query('from') from: Date,
      @Query('to') to: Date,
    ) {
      return this.healthService.getSleepData(from, to);
    }
}
