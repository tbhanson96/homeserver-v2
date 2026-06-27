import { Injectable } from '@nestjs/common';
import {
  HealthAggregation,
  HealthCatalogDto,
  HealthDashboardDto,
  HealthDataDto,
  SleepDataDto,
} from '../models/healthData.dto';
import { RawHealthData, RawSleepData } from '../models/rawHealthData';

@Injectable()
export class HealthService {
  public constructor() {}

  public async importSleepData(data: RawSleepData) {
    throw new Error('App module configured incorrectly.');
  }

  public async importHealthData(data: RawHealthData) {
    throw new Error('App module configured incorrectly.');
  }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    throw new Error('App module configured incorrectly.');
  }

  public async getHealthCatalog(): Promise<HealthCatalogDto> {
    throw new Error('App module configured incorrectly.');
  }

  public async getHealthDashboard(
    from: Date,
    to: Date,
    metrics: string[],
    aggregation: HealthAggregation,
  ): Promise<HealthDashboardDto> {
    throw new Error('App module configured incorrectly.');
  }

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    throw new Error('App module configured incorrectly.');
  }
}
