import { Injectable } from "@nestjs/common";
import { HealthDataDto, HealthMetric, SleepDataDto } from "../models/healthData.dto";
import { RawHealthData, RawSleepData } from "../models/rawHealthData";


@Injectable()
export class HealthService {
  public constructor() { }

  public async importSleepData(data: RawSleepData) {
    throw new Error(`App module configured incorrectly.`)
  };

  public async importHealthData(data: RawHealthData) {
    throw new Error(`App module configured incorrectly.`)
  };

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    throw new Error(`App module configured incorrectly.`)
  };

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    throw new Error(`App module configured incorrectly.`)
  };
}