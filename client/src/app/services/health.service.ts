import { Injectable } from '@angular/core';
import { HealthData, HealthDataDto, SleepDataDto } from '@api/models';
import { HealthService as GeneratedHealthService } from '@api/services';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  constructor(
    private readonly healthApi: GeneratedHealthService,
  ) { }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    return await lastValueFrom(this.healthApi.healthControllerGetHealthData({
      from: from.toISOString(),
      to: to.toISOString(),
      metrics,
    }));
  }

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    return await lastValueFrom(this.healthApi.healthControllerGetSleepData({
      from: from.toISOString(),
      to: to.toISOString(),
    }));
  }

  public aggregateData(data: HealthDataDto, aggregation: 'hourly' | 'daily') {
    const ret: HealthDataDto = { metrics: {}};
    for (const metric of Object.keys(data.metrics)) {
      // Don't aggregate heart rate data.
      if (metric === 'heart_rate') {
        ret.metrics['heart_rate'] = data.metrics['heart_rate'];
        continue;
      }
      const curAggregate: Record<number, HealthData> = {};
      for (const sample of data.metrics[metric].data) {
        let aggDate = new Date(sample.date).setMinutes(0, 0, 0);
        if (aggregation === 'daily') {
          aggDate = new Date(sample.date).setHours(0, 0, 0, 0);
        }
        if (!curAggregate[aggDate]) {
          curAggregate[aggDate] = {
            date: new Date(aggDate).toISOString(),
            source: sample.source,
            qty: sample.qty,
          }
        } else {
          curAggregate[aggDate].qty += sample.qty;
        }
      }
      ret.metrics[metric] = {
        data: Object.values(curAggregate),
        units: data.metrics[metric].units,
        name: data.metrics[metric].name,
      };
    }
    return ret;
  }
}
