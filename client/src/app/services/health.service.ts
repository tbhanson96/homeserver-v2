import { Injectable } from '@angular/core';
import { HealthDataDto } from '@api/models';
import { ApiService } from '@api/services';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  constructor(
    private readonly api: ApiService,
  ) { }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    return await lastValueFrom(this.api.healthControllerGetHealthData({
      from: from.toISOString(),
      to: to.toISOString(),
      metrics,
    }));
  }
}
