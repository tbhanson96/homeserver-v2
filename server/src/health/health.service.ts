import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { HealthDataDto } from "../models/healthData.dto";
import { RawHealthData } from "../models/rawHealthData";

import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";

@Injectable()
export class HealthService {
  public constructor(
    private readonly config: ConfigService,
    private readonly log: Logger,
  ) {
    this.healthDir = this.config.config.health.healthDir;
  }

  private healthDir: string;

  public async importHealthData(data: RawHealthData) {
    const fileName = `${new Date().toISOString()}.json`;
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
      const exports = await readdir(this.healthDir);
      for (const e of exports) {
        const exportDate = new Date(path.basename(e, path.extname(e)));
        if (exportDate >= from && exportDate <= to) {
          const file = await readFile(path.join(this.healthDir, e), { encoding: 'utf-8'});
          const data: RawHealthData = JSON.parse(file);
          const rawMetrics = data.data;
          for (const m of metrics) {
            const sourceMetric = rawMetrics.metrics.find(metric => metric.name === m);
            if (!sourceMetric) {
              continue;
            }
            if (!ret.metrics[m]) {
              ret.metrics[m] = {
                name: m,
                units: sourceMetric.units,
                data: [],
              }
            }
            ret.metrics[m].data.push(...sourceMetric.data);
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