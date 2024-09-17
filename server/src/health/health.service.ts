import { Injectable } from "@nestjs/common";
import { HealthDataDto, HealthMetric } from "../models/healthData.dto";
import { RawHealthData } from "../models/rawHealthData";


@Injectable()
export class HealthService {
  public constructor() { }

  public async importHealthData(data: RawHealthData) {
    throw new Error(`App module configured incorrectly.`)
  };

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    throw new Error(`App module configured incorrectly.`)
  };
}