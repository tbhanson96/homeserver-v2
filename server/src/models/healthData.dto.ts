import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { SleepType } from './health';

export type HealthAggregation = 'hourly' | 'daily';

export class HealthMetric {
  name: string;
  units: string;
  data: HealthData[];
}

export class SleepData {
  qty?: number;
  source: string;
  value: SleepType;
  startDate: Date;
  endDate: Date;
}

export class SleepStageSummaryDto {
  value: SleepType;
  segmentCount: number;
  totalMinutes: number;
  percentOfWindow: number;
}

export class SleepNightSummaryDto {
  date: string;
  startDate: Date;
  endDate: Date;
  segmentCount: number;
  totalMinutes: number;
  asleepMinutes: number;
  awakeMinutes: number;
  stageSummaries: SleepStageSummaryDto[];
}

export class HealthData {
  qty?: number;
  Avg?: number;
  Max?: number;
  Min?: number;
  source: string;
  date: Date;
}

export class HealthMetricCatalogItemDto {
  name: string;
  units: string;
  recordCount: number;
  firstDate: Date;
  lastDate: Date;
  latestValue?: number;
  latestDate?: Date;
  sources: string[];
}

export class HealthMetricBucketDto {
  date: Date;
  sampleCount: number;
  sumValue?: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
}

export class HealthMetricSummaryDto extends HealthMetricCatalogItemDto {
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
  totalValue?: number;
  buckets: HealthMetricBucketDto[];
}

@ApiExtraModels(HealthMetric, HealthData)
export class HealthDataDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/HealthMetric',
    },
  })
  metrics: Record<string, HealthMetric>;
}

export class HealthCatalogDto {
  metrics: HealthMetricCatalogItemDto[];
  metricCount: number;
  sleepRecordCount: number;
  firstRecordDate?: Date;
  lastRecordDate?: Date;
}

@ApiExtraModels(HealthMetricSummaryDto, HealthMetricBucketDto)
export class HealthDashboardDto {
  from: Date;
  to: Date;
  aggregation: HealthAggregation;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/HealthMetricSummaryDto',
    },
  })
  metrics: Record<string, HealthMetricSummaryDto>;
}

export class SleepDataDto {
  data: SleepData[];
}

export class SleepSummaryDto {
  from: Date;
  to: Date;
  recordCount: number;
  firstStartDate?: Date;
  lastEndDate?: Date;
  totalMinutes: number;
  asleepMinutes: number;
  awakeMinutes: number;
  stageSummaries: SleepStageSummaryDto[];
  nights: SleepNightSummaryDto[];
  data: SleepData[];
}
