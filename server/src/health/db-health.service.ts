import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { HealthData, HealthDataDto, SleepDataDto } from '../models/healthData.dto';
import { HealthRecord, SleepRecord } from '../models/health';
import { RawHealthData, RawHealthMetric, RawSleepData, RawSleepMetric } from '../models/rawHealthData';
import { HealthService } from './health.service';

@Injectable()
export class DbHealthService implements HealthService {
  public constructor(
    private readonly log: Logger,
    @InjectRepository(HealthRecord) private readonly healthRepository: Repository<HealthRecord>,
    @InjectRepository(SleepRecord) private readonly sleepRepository: Repository<SleepRecord>,
  ) {}

  private createHealthRecords(metric: RawHealthMetric): HealthRecord[] {
    return metric.data.map((d) => this.healthRepository.create({
      name: metric.name,
      units: metric.units,
      qty: d.qty,
      Avg: d.Avg,
      Min: d.Min,
      Max: d.Max,
      date: new Date(d.date),
      source: d.source,
    }));
  }

  private createSleepRecords(metric: RawSleepMetric): SleepRecord[] {
    return metric.data.map((d) => this.sleepRepository.create({
      value: d.value,
      qty: d.qty,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      source: d.source,
    }));
  }

  private toHealthData(record: HealthRecord): HealthData {
    return {
      qty: record.qty,
      Avg: record.Avg,
      Min: record.Min,
      Max: record.Max,
      date: record.date,
      source: record.source,
    };
  }

  public async importHealthData(data: RawHealthData) {
    this.log.log(`Recieved new health import at: ${new Date()}`);
    try {
      for (const metric of data.data.metrics) {
        const records = this.createHealthRecords(metric);
        await this.healthRepository.upsert(records, ['name', 'date']);
      }
      this.log.log('Imported health data.');
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  public async importSleepData(data: RawSleepData) {
    this.log.log(`Recieved new sleep import at: ${new Date()}`);
    try {
      const metric = data.data.metrics[0];
      const records = this.createSleepRecords(metric);
      await this.sleepRepository.upsert(records, ['value', 'startDate']);
      this.log.log('Imported sleep data.');
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    try {
      const ret: HealthDataDto = { metrics: {} };
      for (const metric of metrics) {
        const records = await this.healthRepository.find({
          where: {
            name: metric,
            date: Between(from, to),
          },
          order: {
            date: 'ASC',
          },
        });

        if (records.length > 0) {
          ret.metrics[metric] = {
            name: metric,
            units: records[0].units,
            data: records.map((record) => this.toHealthData(record)),
          };
        }
      }
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export health data: ${e.message}`);
      throw e;
    }
  }

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    try {
      const ret: SleepDataDto = { data: [] };
      ret.data = await this.sleepRepository.find({
        where: {
          startDate: Between(from, to),
        },
        order: {
          startDate: 'ASC',
        },
      });
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export sleep data: ${e.message}`);
      throw e;
    }
  }
}
