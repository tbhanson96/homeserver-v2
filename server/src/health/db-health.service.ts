import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { HealthData, HealthDataDto, HealthMetric, SleepDataDto } from "../models/healthData.dto";
import { HealthRecord, SleepRecord } from '../models/health';
import { RawHealthData, RawHealthMetric, RawSleepData, RawSleepMetric } from "../models/rawHealthData";
import { HealthService } from './health.service';

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class DbHealthService implements HealthService {
  public constructor(
    private readonly config: ConfigService,
    private readonly log: Logger,
    @InjectModel(HealthRecord.name) private readonly healthModel: Model<HealthRecord>,
    @InjectModel(SleepRecord.name) private readonly sleepModel: Model<SleepRecord>,
  ) {
  }

  private async createHealthRecords(metric: RawHealthMetric) {
    return metric.data.map(d => new this.healthModel({
      name: metric.name,
      units: metric.units,
      qty: d.qty,
      Avg: d.Avg,
      Min: d.Min,
      Max: d.Max,
      date: d.date,
      source: d.source,
    }));
  }

  private async createSleepRecords(metric: RawSleepMetric) {
    return metric.data.map(d => new this.sleepModel({
      value: d.value,
      qty: d.qty,
      startDate: d.startDate,
      endDate: d.endDate,
      source: d.source,
    }));
  }

  public async importHealthData(data: RawHealthData) {
    this.log.log(`Recieved new health import at: ${new Date()}`);
    try {
      for (const metric of data.data.metrics) {
        const records = await this.createHealthRecords(metric);
        await this.healthModel.bulkWrite(records.map(r => ({
          updateOne: {
            filter: { name: r.name, date: r.date },
            update: { $set: r },
            upsert: true,
          }
        })));
      }
      this.log.log(`Imported health data.`);
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  public async importSleepData(data: RawSleepData) {
    this.log.log(`Recieved new sleep import at: ${new Date()}`);
    try {
      // Only one sleep metric is created.
      const metric = data.data.metrics[0];
      const records = await this.createSleepRecords(metric);
      await this.sleepModel.bulkWrite(records.map(r => ({
        updateOne: {
          filter: { startDate: r.startDate, value: r.value },
          update: { $set: r },
          upsert: true,
        }
      })));
      this.log.log(`Imported sleep data.`);
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

  /**
   * Scans health directory and recursively aggregates health data
   * exported from apple health.
   */
  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    try {
      const ret: SleepDataDto = { data: [] };
      const records: SleepRecord[] = await this.sleepModel.find({
        startDate: { $lte: to, $gte: from },
      }).exec();
      ret.data = records;
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export sleep data: ${e.message}`);
      throw e;
    }
  }
}