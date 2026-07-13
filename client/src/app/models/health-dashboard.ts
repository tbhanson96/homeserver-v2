export type HealthAggregation = 'hourly' | 'daily';

export interface HealthMetricCatalogItem {
  name: string;
  units: string;
  recordCount: number;
  firstDate: string;
  lastDate: string;
  latestValue?: number;
  latestDate?: string;
  sources: string[];
}

export interface HealthMetricBucket {
  date: string;
  sampleCount: number;
  sumValue?: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface HealthMetricSummary extends HealthMetricCatalogItem {
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  totalValue?: number;
  buckets: HealthMetricBucket[];
}

export interface HealthCatalog {
  metrics: HealthMetricCatalogItem[];
  metricCount: number;
  sleepRecordCount: number;
  firstRecordDate?: string;
  lastRecordDate?: string;
}

export interface HealthDashboard {
  from: string;
  to: string;
  aggregation: HealthAggregation;
  metrics: Record<string, HealthMetricSummary>;
}

export type SleepStage = 'InBed' | 'Awake' | 'Core' | 'Deep' | 'REM';

export interface SleepSegment {
  qty?: number;
  source: string;
  value: SleepStage;
  startDate: string;
  endDate: string;
}

export interface SleepStageSummary {
  value: SleepStage;
  segmentCount: number;
  totalMinutes: number;
  percentOfWindow: number;
}

export interface SleepNightSummary {
  date: string;
  startDate: string;
  endDate: string;
  segmentCount: number;
  totalMinutes: number;
  asleepMinutes: number;
  awakeMinutes: number;
  stageSummaries: SleepStageSummary[];
}

export interface SleepSummary {
  from: string;
  to: string;
  recordCount: number;
  firstStartDate?: string;
  lastEndDate?: string;
  totalMinutes: number;
  asleepMinutes: number;
  awakeMinutes: number;
  stageSummaries: SleepStageSummary[];
  nights: SleepNightSummary[];
  data: SleepSegment[];
}
