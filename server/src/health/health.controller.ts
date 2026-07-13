import { Body, Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ApiKeyGuard } from '../auth/apikey.guard';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import {
  HealthAggregation,
  HealthCatalogDto,
  HealthDashboardDto,
  HealthDataDto,
  SleepDataDto,
  SleepSummaryDto,
} from '../models/healthData.dto';
import { RawHealthData } from '../models/rawHealthData';
import { joinRoutes, routes } from '../routes';
import { HealthService } from './health.service';
import { Logger } from '@nestjs/common';

@Controller(joinRoutes(routes.api, routes.health))
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiAcceptedResponse({ description: 'Health data import started' })
  @ApiBody({ type: Object })
  @UseGuards(ApiKeyGuard)
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  importHealthData(@Body() healthData: RawHealthData, @Res() response: Response) {
    response.sendStatus(HttpStatus.ACCEPTED);
    void this.healthService.importHealthData(healthData).catch((e: any) => {
      this.logger.error(`Async health import failed: ${e.message}`);
    });
  }

  @Post('sleep')
  @ApiAcceptedResponse({ description: 'Sleep data import started' })
  @ApiBody({ type: Object })
  @UseGuards(ApiKeyGuard)
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  importSleepData(@Body() healthData: any, @Res() response: Response) {
    response.sendStatus(HttpStatus.ACCEPTED);
    void this.healthService.importSleepData(healthData).catch((e: any) => {
      this.logger.error(`Async sleep import failed: ${e.message}`);
    });
  }

  @Get()
  @UseGuards(JwtOrApiKeyGuard)
  @ApiOkResponse({ description: 'success', type: HealthDataDto })
  @ApiQuery({ name: 'from', type: Date })
  @ApiQuery({ name: 'to', type: Date })
  @ApiQuery({ name: 'metrics', type: String, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  async getHealthData(
    @Query('from') from: Date,
    @Query('to') to: Date,
    @Query('metrics') metrics: string[],
  ) {
    if (typeof metrics === 'string') {
      metrics = [metrics];
    }
    return await this.healthService.getHealthData(from, to, metrics);
  }

  @Get('catalog')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiOkResponse({ description: 'success', type: HealthCatalogDto })
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  async getHealthCatalog() {
    return await this.healthService.getHealthCatalog();
  }

  @Get('dashboard')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiOkResponse({ description: 'success', type: HealthDashboardDto })
  @ApiQuery({ name: 'from', type: Date })
  @ApiQuery({ name: 'to', type: Date })
  @ApiQuery({ name: 'aggregation', enum: ['hourly', 'daily'] })
  @ApiQuery({ name: 'metrics', type: String, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  async getHealthDashboard(
    @Query('from') from: Date,
    @Query('to') to: Date,
    @Query('aggregation') aggregation: HealthAggregation,
    @Query('metrics') metrics: string[],
  ) {
    if (typeof metrics === 'string') {
      metrics = [metrics];
    }

    return await this.healthService.getHealthDashboard(
      from,
      to,
      metrics || [],
      aggregation || 'hourly',
    );
  }

  @Get('sleep/summary')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiOkResponse({ description: 'success', type: SleepSummaryDto })
  @ApiQuery({ name: 'from', type: Date })
  @ApiQuery({ name: 'to', type: Date })
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  async getSleepSummary(
    @Query('from') from: Date,
    @Query('to') to: Date,
  ) {
    return this.healthService.getSleepSummary(from, to);
  }

  @Get('sleep')
  @UseGuards(JwtOrApiKeyGuard)
  @ApiOkResponse({ description: 'success', type: SleepDataDto })
  @ApiQuery({ name: 'from', type: Date })
  @ApiQuery({ name: 'to', type: Date })
  @ApiUnauthorizedResponse({ description: 'Failed to login' })
  async getSleepData(
    @Query('from') from: Date,
    @Query('to') to: Date,
  ) {
    return this.healthService.getSleepData(from, to);
  }
}
