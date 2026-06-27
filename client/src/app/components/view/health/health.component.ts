import { UiStateActions } from '@actions/ui-state.actions';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideNativeDateTimeAdapter } from '@dhutaryan/ngx-mat-timepicker';
import {
  HealthAggregation,
  HealthCatalog,
  HealthMetricBucket,
  HealthMetricCatalogItem,
  HealthMetricSummary,
  HealthDashboard,
} from '@models/health-dashboard';
import { HealthService } from '@services/health.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import 'chartjs-adapter-moment';

type OverviewCard = {
  name: string;
  title: string;
  units: string;
  primaryValue?: number;
  secondaryValue?: number;
  secondaryLabel: string;
  trendText: string;
  helperText: string;
};

type Highlight = {
  title: string;
  body: string;
  icon: string;
};

type DeepAnalysis = {
  name: string;
  title: string;
  trendText: string;
  coverageText: string;
  peakText: string;
  valueText: string;
  sourceText: string;
  notes: string[];
};

type ComparisonRow = {
  name: string;
  label: string;
  units: string;
  value?: number;
  helper: string;
};

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  providers: [
    provideNativeDateAdapter(),
    provideNativeDateTimeAdapter(),
  ],
  styleUrls: ['./health.component.scss'],
  standalone: false
})
export class HealthComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') private trendCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparisonCanvas') private comparisonCanvas?: ElementRef<HTMLCanvasElement>;

  public catalog?: HealthCatalog;
  public dashboard?: HealthDashboard;
  public from = new Date();
  public to = new Date();
  public aggregation: HealthAggregation = 'hourly';
  public metricFilter = '';
  public selectedMetrics: string[] = [];
  public selectedMetric = '';
  public overviewCards: OverviewCard[] = [];
  public highlights: Highlight[] = [];
  public deepAnalyses: DeepAnalysis[] = [];
  public comparisonRows: ComparisonRow[] = [];
  public activePresetHours = 36;

  private trendChart?: Chart;
  private comparisonChart?: Chart;
  private viewReady = false;

  private readonly preferredMetrics = [
    'total_energy',
    'heart_rate',
    'step_count',
    'active_energy',
    'basal_energy_burned',
    'apple_exercise_time',
    'blood_oxygen_saturation',
    'resting_heart_rate',
    'walking_running_distance',
  ];

  public readonly presets = [
    { label: '12H', hours: 12 },
    { label: '24H', hours: 24 },
    { label: '36H', hours: 36 },
    { label: '3D', hours: 72 },
  ];

  constructor(
    private readonly service: HealthService,
    private readonly ui: UiStateActions,
  ) {}

  async ngOnInit(): Promise<void> {
    this.ui.setCurrentApp('Health');
    await this.loadCatalog();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.comparisonChart?.destroy();
  }

  public get hasCatalog(): boolean {
    return !!this.catalog?.metrics.length;
  }

  public get selectedMetricSummary(): HealthMetricSummary | undefined {
    return this.selectedMetric ? this.dashboard?.metrics[this.selectedMetric] : undefined;
  }

  public get filteredCatalog(): HealthMetricCatalogItem[] {
    if (!this.catalog) {
      return [];
    }

    const query = this.metricFilter.trim().toLowerCase();
    if (!query) {
      return this.catalog.metrics;
    }

    return this.catalog.metrics.filter((metric) =>
      metric.name.toLowerCase().includes(query)
      || this.formatMetricName(metric.name).toLowerCase().includes(query)
      || metric.units.toLowerCase().includes(query),
    );
  }

  public get totalVisibleRecords(): number {
    return this.selectedMetrics
      .map((name) => this.dashboard?.metrics[name]?.recordCount || 0)
      .reduce((sum, count) => sum + count, 0);
  }

  public async loadCatalog(): Promise<void> {
    this.ui.setAppBusy(true);
    try {
      this.catalog = await this.service.getHealthCatalog();
      if (!this.catalog.metrics.length) {
        this.dashboard = undefined;
        this.selectedMetrics = [];
        this.selectedMetric = '';
        this.overviewCards = [];
        this.highlights = [];
        this.deepAnalyses = [];
        this.comparisonRows = [];
        return;
      }

      this.initializeRangeFromCatalog(this.catalog);
      this.selectedMetrics = this.pickDefaultMetrics(this.catalog.metrics).map((metric) => metric.name);
      this.selectedMetric = this.selectedMetrics[0] || '';
      await this.refreshDashboard();
    } finally {
      this.ui.setAppBusy(false);
    }
  }

  public async refreshDashboard(): Promise<void> {
    if (!this.selectedMetrics.length) {
      this.dashboard = undefined;
      this.overviewCards = [];
      this.highlights = [];
      this.deepAnalyses = [];
      this.comparisonRows = [];
      this.renderCharts();
      return;
    }

    this.ui.setAppBusy(true);
    try {
      this.dashboard = await this.service.getHealthDashboard(
        this.from,
        this.to,
        this.selectedMetrics,
        this.aggregation,
      );

      const availableMetricNames = Object.keys(this.dashboard.metrics);
      if (!availableMetricNames.includes(this.selectedMetric)) {
        this.selectedMetric = availableMetricNames[0] || '';
      }

      this.buildViewModels();
      this.renderCharts();
    } finally {
      this.ui.setAppBusy(false);
    }
  }

  public async onPresetSelect(hours: number): Promise<void> {
    this.activePresetHours = hours;
    this.applyRelativeRange(hours);
    await this.refreshDashboard();
  }

  public async onSearch(): Promise<void> {
    await this.refreshDashboard();
  }

  public async toggleMetric(metricName: string): Promise<void> {
    if (this.isMetricSelected(metricName)) {
      if (this.selectedMetrics.length === 1) {
        return;
      }
      this.selectedMetrics = this.selectedMetrics.filter((name) => name !== metricName);
    } else {
      this.selectedMetrics = [...this.selectedMetrics, metricName];
    }

    if (!this.selectedMetric || !this.selectedMetrics.includes(this.selectedMetric)) {
      this.selectedMetric = this.selectedMetrics[0] || '';
    }

    await this.refreshDashboard();
  }

  public isMetricSelected(metricName: string): boolean {
    return this.selectedMetrics.includes(metricName);
  }

  public onSelectedMetricChange(metricName: string): void {
    this.selectedMetric = metricName;
    this.renderCharts();
  }

  public formatMetricName(metricName: string): string {
    return metricName
      .split('_')
      .map((part) => {
        if (part === 'hrv') {
          return 'HRV';
        }
        if (part === 'apple') {
          return 'Apple';
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  public formatMetricValue(summary: Pick<HealthMetricCatalogItem, 'name' | 'units'>, value?: number): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'No data';
    }

    const digits = this.getFractionDigits(summary.units, value);
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits === 0 ? 0 : Math.min(digits, value < 10 ? 1 : 0),
    }).format(value);

    return `${formatted} ${summary.units}`;
  }

  public formatMetricValueForUnits(units: string, value?: number): string {
    return this.formatMetricValue({ name: '', units }, value);
  }

  public formatDate(date?: string | Date): string {
    if (!date) {
      return 'Unavailable';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  }

  public formatCompactDate(date?: string | Date): string {
    if (!date) {
      return 'Unavailable';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: this.aggregation === 'hourly' ? 'numeric' : undefined,
    }).format(new Date(date));
  }

  public formatSources(sources: string[]): string {
    return sources.length ? sources.join(', ') : 'No source metadata';
  }

  public getTrendText(summary: HealthMetricSummary): string {
    const buckets = summary.buckets
      .map((bucket) => this.getBucketDisplayValue(summary, bucket))
      .filter((value): value is number => value !== undefined);

    if (buckets.length < 2) {
      return 'Trend unavailable';
    }

    const first = buckets[0];
    const last = buckets[buckets.length - 1];
    if (first === 0) {
      return last === 0 ? 'Stable across window' : 'Started from zero';
    }

    const change = ((last - first) / Math.abs(first)) * 100;
    const direction = change > 2 ? 'Up' : change < -2 ? 'Down' : 'Flat';
    return `${direction} ${Math.abs(change).toFixed(1)}%`;
  }

  public getMetricDetail(summary: HealthMetricSummary): string {
    const mode = this.useAverageMode(summary);
    if (mode) {
      return `Average ${this.formatMetricValue(summary, summary.averageValue)}`;
    }
    return `Total ${this.formatMetricValue(summary, summary.totalValue)}`;
  }

  private initializeRangeFromCatalog(catalog: HealthCatalog): void {
    const latestDate = new Date(catalog.lastRecordDate || catalog.metrics[0].lastDate);
    const earliestDate = new Date(catalog.firstRecordDate || catalog.metrics[0].firstDate);
    this.to = latestDate;
    this.from = new Date(Math.max(earliestDate.getTime(), latestDate.getTime() - (this.activePresetHours * 60 * 60 * 1000)));
  }

  private applyRelativeRange(hours: number): void {
    const latestDate = this.catalog?.lastRecordDate
      ? new Date(this.catalog.lastRecordDate)
      : new Date();
    const earliestDate = this.catalog?.firstRecordDate
      ? new Date(this.catalog.firstRecordDate)
      : new Date(latestDate.getTime() - (hours * 60 * 60 * 1000));
    this.to = latestDate;
    this.from = new Date(Math.max(earliestDate.getTime(), latestDate.getTime() - (hours * 60 * 60 * 1000)));
  }

  private pickDefaultMetrics(metrics: HealthMetricCatalogItem[]): HealthMetricCatalogItem[] {
    const byName = new Map(metrics.map((metric) => [metric.name, metric]));
    const defaults: HealthMetricCatalogItem[] = [];

    for (const metricName of this.preferredMetrics) {
      const metric = byName.get(metricName);
      if (metric) {
        defaults.push(metric);
      }
    }

    for (const metric of [...metrics].sort((a, b) => b.recordCount - a.recordCount)) {
      if (!defaults.find((entry) => entry.name === metric.name)) {
        defaults.push(metric);
      }
      if (defaults.length >= 6) {
        break;
      }
    }

    return defaults.slice(0, 6);
  }

  private buildViewModels(): void {
    const summaries = this.selectedMetrics
      .map((metricName) => this.dashboard?.metrics[metricName])
      .filter((metric): metric is HealthMetricSummary => !!metric);

    this.overviewCards = summaries.slice(0, 6).map((summary) => ({
      name: summary.name,
      title: this.formatMetricName(summary.name),
      units: summary.units,
      primaryValue: summary.latestValue,
      secondaryValue: this.useAverageMode(summary) ? summary.averageValue : summary.totalValue,
      secondaryLabel: this.useAverageMode(summary) ? 'Window average' : 'Window total',
      trendText: this.getTrendText(summary),
      helperText: `${summary.recordCount.toLocaleString()} samples`,
    }));

    this.comparisonRows = summaries.map((summary) => ({
      name: summary.name,
      label: this.formatMetricName(summary.name),
      units: summary.units,
      value: this.useAverageMode(summary) ? summary.averageValue : summary.totalValue,
      helper: this.useAverageMode(summary) ? 'Average' : 'Total',
    }));

    this.highlights = this.buildHighlights(summaries);
    this.deepAnalyses = summaries.map((summary) => this.buildDeepAnalysis(summary));
  }

  private buildHighlights(summaries: HealthMetricSummary[]): Highlight[] {
    if (!summaries.length) {
      return [];
    }

    const highestTotal = [...summaries]
      .filter((summary) => !this.useAverageMode(summary))
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))[0];
    const highestAverage = [...summaries]
      .filter((summary) => this.useAverageMode(summary))
      .sort((a, b) => (b.averageValue || 0) - (a.averageValue || 0))[0];
    const latestMetric = [...summaries]
      .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())[0];
    const widestCoverage = [...summaries]
      .sort((a, b) => b.recordCount - a.recordCount)[0];

    const highlights: Highlight[] = [
      {
        icon: 'monitoring',
        title: 'Coverage',
        body: `${this.catalog?.metricCount || 0} metrics are available in the current import, and ${this.selectedMetrics.length} are on the dashboard right now.`,
      },
      {
        icon: 'stacked_line_chart',
        title: 'Most sampled signal',
        body: `${this.formatMetricName(widestCoverage.name)} contributes ${widestCoverage.recordCount.toLocaleString()} samples in the current window.`,
      },
      {
        icon: 'schedule',
        title: 'Freshest reading',
        body: `${this.formatMetricName(latestMetric.name)} was last updated on ${this.formatDate(latestMetric.lastDate)}.`,
      },
    ];

    if (highestTotal) {
      highlights.push({
        icon: 'local_fire_department',
        title: 'Biggest total',
        body: `${this.formatMetricName(highestTotal.name)} leads the selected set with ${this.formatMetricValue(highestTotal, highestTotal.totalValue)} in this window.`,
      });
    }

    if (highestAverage) {
      highlights.push({
        icon: 'favorite',
        title: 'Strongest average signal',
        body: `${this.formatMetricName(highestAverage.name)} is averaging ${this.formatMetricValue(highestAverage, highestAverage.averageValue)} right now.`,
      });
    }

    highlights.push({
      icon: 'bedtime',
      title: 'Sleep import status',
      body: this.catalog?.sleepRecordCount
        ? `${this.catalog.sleepRecordCount.toLocaleString()} sleep segments are available for overlay work.`
        : 'Sleep records are not imported yet, so the dashboard is focusing on activity, cardio, and movement metrics.',
    });

    return highlights;
  }

  private buildDeepAnalysis(summary: HealthMetricSummary): DeepAnalysis {
    const peakBucket = [...summary.buckets]
      .sort((a, b) => (this.getBucketDisplayValue(summary, b) || 0) - (this.getBucketDisplayValue(summary, a) || 0))[0];
    const peakValue = peakBucket ? this.getBucketDisplayValue(summary, peakBucket) : undefined;
    const notes = [
      `${summary.recordCount.toLocaleString()} raw samples rolled into ${summary.buckets.length.toLocaleString()} ${this.aggregation} buckets.`,
      `Window spans ${this.formatDate(summary.firstDate)} to ${this.formatDate(summary.lastDate)}.`,
      this.useAverageMode(summary)
        ? `Average signal sits at ${this.formatMetricValue(summary, summary.averageValue)}.`
        : `Accumulated total reaches ${this.formatMetricValue(summary, summary.totalValue)}.`,
    ];

    if (summary.minValue !== undefined && summary.maxValue !== undefined) {
      notes.push(`Observed range runs from ${this.formatMetricValue(summary, summary.minValue)} up to ${this.formatMetricValue(summary, summary.maxValue)}.`);
    }

    return {
      name: summary.name,
      title: this.formatMetricName(summary.name),
      trendText: this.getTrendText(summary),
      coverageText: `${summary.recordCount.toLocaleString()} samples from ${summary.sources.length || 1} source${summary.sources.length === 1 ? '' : 's'}`,
      peakText: peakBucket && peakValue !== undefined
        ? `${this.formatMetricValue(summary, peakValue)} at ${this.formatDate(peakBucket.date)}`
        : 'Peak bucket unavailable',
      valueText: this.getMetricDetail(summary),
      sourceText: this.formatSources(summary.sources),
      notes,
    };
  }

  private renderCharts(): void {
    if (!this.viewReady) {
      return;
    }

    this.renderTrendChart();
    this.renderComparisonChart();
  }

  private renderTrendChart(): void {
    this.trendChart?.destroy();

    const summary = this.selectedMetricSummary;
    const canvas = this.trendCanvas?.nativeElement;
    if (!summary || !canvas || !summary.buckets.length) {
      return;
    }

    const labels = summary.buckets.map((bucket) => new Date(bucket.date).toISOString());
    const values = summary.buckets.map((bucket) => this.getBucketDisplayValue(summary, bucket));
    const rollingWindow = this.aggregation === 'hourly' ? 3 : 2;
    const rolling = values.map((_, index, all) => {
      const slice = all.slice(Math.max(0, index - rollingWindow + 1), index + 1)
        .filter((value): value is number => value !== undefined);
      if (!slice.length) {
        return undefined;
      }
      return slice.reduce((sum, value) => sum + value, 0) / slice.length;
    });

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.formatMetricName(summary.name),
            data: values,
            borderColor: '#1565c0',
            backgroundColor: 'rgba(21, 101, 192, 0.14)',
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Rolling trend',
            data: rolling,
            borderColor: '#ef6c00',
            borderDash: [6, 6],
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: this.aggregation === 'hourly' ? 'MMM d, h:mm a' : 'MMM d',
            },
          },
          y: {
            title: {
              display: true,
              text: summary.units,
            },
          },
        },
      },
    };

    this.trendChart = new Chart(canvas, config);
  }

  private renderComparisonChart(): void {
    this.comparisonChart?.destroy();

    const canvas = this.comparisonCanvas?.nativeElement;
    const rows = this.comparisonRows.filter((row) => row.value !== undefined);
    if (!canvas || !rows.length) {
      return;
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: rows.map((row) => row.label),
        datasets: [{
          label: 'Window comparison',
          data: rows.map((row) => row.value),
          backgroundColor: [
            '#1565c0',
            '#ef6c00',
            '#2e7d32',
            '#6a1b9a',
            '#00838f',
            '#c62828',
          ],
          borderRadius: 10,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Window value',
            },
          },
        },
      },
    };

    this.comparisonChart = new Chart(canvas, config);
  }

  private getBucketDisplayValue(summary: HealthMetricSummary, bucket: HealthMetricBucket): number | undefined {
    return this.useAverageMode(summary) ? bucket.averageValue : bucket.sumValue;
  }

  private useAverageMode(summary: Pick<HealthMetricCatalogItem, 'name' | 'units'>): boolean {
    const averageMetrics = new Set([
      'blood_oxygen_saturation',
      'environmental_audio_exposure',
      'headphone_audio_exposure',
      'heart_rate',
      'heart_rate_variability',
      'physical_effort',
      'resting_heart_rate',
      'stair_speed_down',
      'stair_speed_up',
      'walking_asymmetry_percentage',
      'walking_double_support_percentage',
      'walking_heart_rate_average',
      'walking_speed',
      'walking_step_length',
    ]);

    if (averageMetrics.has(summary.name)) {
      return true;
    }

    return ['count/min', '%', 'dBASPL', 'ft/s', 'mi/hr', 'ms', 'kcal/hr·kg', 'in'].includes(summary.units);
  }

  private getFractionDigits(units: string, value: number): number {
    if (['count', 'min'].includes(units)) {
      return 0;
    }
    if (['count/min', '%', 'mi/hr', 'ft/s', 'ms', 'in'].includes(units)) {
      return 1;
    }
    if (units === 'kcal' || units === 'mi' || units === 'dBASPL') {
      return value >= 100 ? 0 : value >= 10 ? 1 : 2;
    }
    return 2;
  }
}
