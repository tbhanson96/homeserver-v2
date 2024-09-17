import { Controller, Post, Body, Get, UseGuards, Logger, Query } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/apikey.guard';
import { JwtGuard } from '../auth/jwt.guard';
import { HealthDataDto } from '../models/healthData.dto';
import { HealthService } from './health.service';

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
    async login(@Body() healthData: any) {
      this.logger.log("Received health data.");
      await this.healthService.importHealthData(healthData);
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
      @Query('metrics') metrics: string[]
    ) {
      // Fix bug with query string arrays.
      if (typeof metrics === 'string') {
        metrics = [metrics]
      }
      return await this.healthService.getHealthData(from, to, metrics);
    }
}
