import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HealthDataDto } from '@api/models';
import { HealthService } from '@services/health.service';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit, OnDestroy {

  public healthData: HealthDataDto;
  // TODO remove and replace with chart.js
  public healthString: string;
  public from = new Date(new Date().setHours(0, 0, 0, 0));
  public to = new Date();
  public metrics = ['heart_rate'];

  constructor (
    private readonly service: HealthService,
    private readonly ui: UiStateActions,
  ) { }

  async ngOnInit(): Promise<void> {
    this.ui.setAppBusy(true);
    try {
      await this.getHealthData();
    } catch (e: any) {
      throw new Error('Failed to get health data.');
    } finally {
      this.ui.setAppBusy(false);
    }
  }

  public async getHealthData() {
    this.healthData = await this.service.getHealthData(this.from, this.to, this.metrics);
    this.healthString = JSON.stringify(this.healthData);
  }

  ngOnDestroy(): void {
    
  }

}
