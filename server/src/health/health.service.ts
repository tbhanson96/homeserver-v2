import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { HealthData, HealthDataDto, HealthMetric } from "../models/healthData.dto";
import { HealthRecord } from '../models/health';
import { RawHealthData } from "../models/rawHealthData";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class HealthService {
  public constructor(
    private readonly config: ConfigService,
    private readonly log: Logger,
    @InjectModel(HealthRecord.name) private readonly healthModel: Model<HealthRecord>,
  ) {
  }

  private async addHealthRecord(metric: HealthMetric) {
    for (const d of metric.data) {
      const newRecord = new this.healthModel({
        name: metric.name,
        units: metric.units,
        qty: d.qty,
        Avg: d.Avg,
        Min: d.Min,
        Max: d.Max,
        date: d.date,
        source: d.source,
      });
      await newRecord.save();
    }
  }

  public async importHealthData(data: RawHealthData) {
    try {
      for (const metric of data.data.metrics) {
        await this.addHealthRecord(metric);
      }
      this.log.log(`Imported health data.`);
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  /**
   * Scans health directory and recursively aggregates health data
   * exported from apple health.
   */
  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    try {
      const ret: HealthDataDto = { metrics: { } };
      for (const metric of metrics) {
        const healthMetric: HealthMetric | null = await this.healthModel.findOne({ name: metric });
        if (healthMetric) {
          const records: HealthData[] = await this.healthModel.find({
            name: metric,
            date: { $lte: to, $gte: from },
          }, { qty: 1, Avg: 1, Min: 1, Max: 1, date: 1, source: 1 }).exec();
          if (records.length > 0) {
            ret.metrics[metric] = {
              name: metric,
              units: healthMetric.units,
              data: records,
            }
          }
        }
      }
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export health data: ${e.message}`);
      throw e;
    }
  }
}