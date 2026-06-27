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
