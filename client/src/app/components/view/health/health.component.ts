import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HealthDataDto, SleepDataDto } from '@api/models';
import { provideNativeDateTimeAdapter } from '@dhutaryan/ngx-mat-timepicker';
import { HealthService } from '@services/health.service';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-moment';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  providers: [
    provideNativeDateAdapter(),
    provideNativeDateTimeAdapter(),
  ],
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit, OnDestroy {

  private healthData: HealthDataDto;
  public aggHealthData: HealthDataDto;
  public sleepData: SleepDataDto;
  public from = new Date();
  public fromTime = new Date();
  public to = new Date();
  public toTime = new Date();
  public metrics = ['heart_rate'];
  public customMetric = 'protein';
  public chart: Chart;
  public curChart = 0;
  public aggregation: 'hourly' | 'daily' = 'daily';

  constructor (
    private readonly service: HealthService,
    private readonly ui: UiStateActions,
  ) { }

  async ngOnInit(): Promise<void> {
    this.ui.setCurrentApp('Health');
    await this.getAllHealthData();
  }

  public async getAllHealthData() {
    this.ui.setAppBusy(true);
    try {
      this.healthData = await this.service.getHealthData(
        this.from,
        this.to,
        [...this.metrics, this.customMetric]
      );
      this.aggHealthData = this.service.aggregateData(this.healthData, this.aggregation);
      this.sleepData = await this.service.getSleepData(this.from, this.to);
      this.renderChart(this.curChart);
    } catch (e: any) {
      throw new Error(`Failed to get health data: ${e}`);
    } finally {
      this.ui.setAppBusy(false);
    }
  }

  public renderChart(event: number) {
    console.log(`${this.fromTime} - ${this.toTime}`);
    this.curChart = event;
    switch (event) {
      case 0:
        this.renderHeartRateChart();
        break;
      case 3:
        this.renderCustomChart(); 
        break;
    }
  }

  private renderCustomChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: this.aggHealthData.metrics[this.customMetric]?.data.map(d => new Date(d.date).toISOString()),
        datasets: [
          {
            label: this.customMetric,
            data: this.aggHealthData.metrics[this.customMetric]?.data.map(d => d.Avg || d.qty), 
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'll',
            }
          },
          y: {
            title: {
              display: true,
              text: this.aggHealthData.metrics[this.customMetric]?.units,
            }
          }
        }
      }
    });

  }

  private renderHeartRateChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('chart', {
      type: 'line',
      data: {
        labels: this.healthData.metrics['heart_rate']?.data.map(d => new Date(d.date).toISOString()),
        datasets: [
          {
            label: 'Heart Rate',
            data: this.healthData.metrics['heart_rate']?.data.map(d => d.Avg || d.qty), 
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'll',
            }
          },
          y: {
            title: {
              display: true,
              text: this.healthData.metrics['heart_rate']?.units,
            }
          }
        }
      }
    });
  }


  ngOnDestroy(): void {
    
  }

}
