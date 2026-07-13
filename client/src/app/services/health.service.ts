import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HealthDataDto, SleepDataDto } from '@api/models';
import { HealthService as GeneratedHealthService } from '@api/services';
import {
  HealthAggregation,
  HealthCatalog,
  HealthDashboard,
  SleepSummary,
} from '@models/health-dashboard';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  constructor(
    private readonly healthApi: GeneratedHealthService,
    private readonly http: HttpClient,
  ) { }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    return await lastValueFrom(this.healthApi.healthControllerGetHealthData({
      from: from.toISOString(),
      to: to.toISOString(),
      metrics,
    }));
  }

  public async getHealthCatalog(): Promise<HealthCatalog> {
    return await lastValueFrom(this.http.get<HealthCatalog>('/api/health/catalog'));
  }

  public async getHealthDashboard(
    from: Date,
    to: Date,
    metrics: string[],
    aggregation: HealthAggregation,
  ): Promise<HealthDashboard> {
    let params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', to.toISOString())
      .set('aggregation', aggregation);

    for (const metric of metrics) {
      params = params.append('metrics', metric);
    }

    return await lastValueFrom(
      this.http.get<HealthDashboard>('/api/health/dashboard', { params }),
    );
  }

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    return await lastValueFrom(this.healthApi.healthControllerGetSleepData({
      from: from.toISOString(),
      to: to.toISOString(),
    }));
  }

  public async getSleepSummary(from: Date, to: Date): Promise<SleepSummary> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', to.toISOString());

    return await lastValueFrom(
      this.http.get<SleepSummary>('/api/health/sleep/summary', { params }),
    );
  }
}
