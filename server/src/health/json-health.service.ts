import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { HealthDataDto } from "../models/healthData.dto";
import { RawHealthData } from "../models/rawHealthData";
import { HealthService } from './health.service';

import { readFile, writeFile } from "fs/promises";
import path from "path";

@Injectable()
export class JsonHealthService implements HealthService {
  
  private healthDir: string;

  public constructor(
    private config: ConfigService,
    private readonly log: Logger,
  ) {
    this.healthDir = this.config.config.health.healthDir;
  }

  public async importHealthData(data: RawHealthData) {
    const fileName = `data.json`;
    try {
      await writeFile(path.join(this.healthDir, fileName), JSON.stringify(data));
      this.log.log(`Imported health data: ${fileName}`);
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
      const ret: HealthDataDto = { metrics: {} };
      const file = await readFile(path.join(this.healthDir, 'data.json'), { encoding: 'utf-8'});
      const data: RawHealthData = JSON.parse(file);
      const rawMetrics = data.data;
      for (const m of metrics) {
        const sourceMetric = rawMetrics.metrics.find(metric => metric.name === m);
        if (!sourceMetric) {
          continue;
        }
        ret.metrics[m] = {
          name: m,
          units: sourceMetric.units,
          data: sourceMetric.data.filter(d => new Date(d.date) <= from && new Date(d.date) >= to),
        }
      }
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export health data: ${e.message}`);
      throw e;
    }
  }
}