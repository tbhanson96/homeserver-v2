import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HealthDataDto } from '@api/models';
import { MatNativeDateTimeModule, MatTimepickerModule, provideNativeDateTimeAdapter } from '@dhutaryan/ngx-mat-timepicker';
import { HealthService } from '@services/health.service';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-moment';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateTimeModule,
    FlexLayoutModule,
    FormsModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    provideNativeDateTimeAdapter(),
  ],
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit, OnDestroy {

  public healthData: HealthDataDto;
  public from = new Date(new Date().setHours(0, 0, 0, 0));
  public to = new Date();
  public metrics = ['heart_rate'];
  public chart: Chart;

  constructor (
    private readonly service: HealthService,
    private readonly ui: UiStateActions,
  ) { }

  async ngOnInit(): Promise<void> {
    this.ui.setCurrentApp('Health');
    this.ui.setAppBusy(true);
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              tooltipFormat: 'll',
            }
          }
        }
      }
    });
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
    console.log(JSON.stringify(this.healthData));
    this.chart.data = {
      labels: this.healthData.metrics['heart_rate'].data.map(d => new Date(d.date).toISOString()),
      datasets: [
        {
          label: 'Heart Rate',
          data: this.healthData.metrics['heart_rate'].data.map(d => d.Avg), 
        },
      ]
    }
    this.chart.update();
  }


  ngOnDestroy(): void {
    
  }

}
