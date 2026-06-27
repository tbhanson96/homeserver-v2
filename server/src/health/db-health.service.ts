import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  HealthAggregation,
  HealthCatalogDto,
  HealthDashboardDto,
  HealthData,
  HealthDataDto,
  HealthMetricBucketDto,
  HealthMetricCatalogItemDto,
  HealthMetricSummaryDto,
  SleepDataDto,
} from '../models/healthData.dto';
import { HealthRecord, SleepRecord } from '../models/health';
import { RawHealthData, RawHealthMetric, RawSleepData, RawSleepMetric } from '../models/rawHealthData';
import { HealthService } from './health.service';
import { getSyntheticMetricDefinition, listSyntheticMetricDefinitions } from './synthetic-metrics';

type MetricStatsRow = {
  name: string;
  units: string;
  recordCount: number | string;
  firstDate: string;
  lastDate: string;
  averageValue: number | string | null;
  minValue: number | string | null;
  maxValue: number | string | null;
  totalValue: number | string | null;
  sources: string | null;
};

type MetricLatestRow = {
  latestValue: number | string | null;
  latestDate: string;
};

type MetricBucketRow = {
  bucketDate: string;
  sampleCount: number | string;
  sumValue: number | string | null;
  averageValue: number | string | null;
  minValue: number | string | null;
  maxValue: number | string | null;
};

type MetricTrail = Set<string>;

type ResolvedMetricSeries = {
  name: string;
  units: string;
  data: HealthData[];
};

@Injectable()
export class DbHealthService implements HealthService {
  private static readonly SQLITE_MAX_VARIABLES = 999;
  private static readonly HEALTH_RECORD_COLUMN_COUNT = 8;
  private static readonly SLEEP_RECORD_COLUMN_COUNT = 5;

  public constructor(
    private readonly log: Logger,
    @InjectRepository(HealthRecord) private readonly healthRepository: Repository<HealthRecord>,
    @InjectRepository(SleepRecord) private readonly sleepRepository: Repository<SleepRecord>,
  ) {}

  private async upsertInChunks<T extends object>(
    repository: Repository<T>,
    records: T[],
    conflictPaths: string[],
    columnCount: number,
  ) {
    const chunkSize = Math.max(1, Math.floor(DbHealthService.SQLITE_MAX_VARIABLES / columnCount));

    for (let i = 0; i < records.length; i += chunkSize) {
      await repository.upsert(records.slice(i, i + chunkSize), conflictPaths);
    }
  }

  private createHealthRecords(metric: RawHealthMetric): HealthRecord[] {
    return metric.data.map((d) => this.healthRepository.create({
      name: metric.name,
      units: metric.units,
      qty: d.qty,
      Avg: d.Avg,
      Min: d.Min,
      Max: d.Max,
      date: new Date(d.date),
      source: d.source,
    }));
  }

  private createSleepRecords(metric: RawSleepMetric): SleepRecord[] {
    return metric.data.map((d) => this.sleepRepository.create({
      value: d.value,
      qty: d.qty,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      source: d.source,
    }));
  }

  private toHealthData(record: HealthRecord): HealthData {
    return {
      qty: record.qty,
      Avg: record.Avg,
      Min: record.Min,
      Max: record.Max,
      date: record.date,
      source: record.source,
    };
  }

  private toSqliteDate(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  }

  private parseSqliteDate(value: string): Date {
    if (/z$/i.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)) {
      return new Date(value);
    }

    return new Date(value.replace(' ', 'T') + 'Z');
  }

  private cloneTrail(metric: string, trail: MetricTrail): MetricTrail {
    if (trail.has(metric)) {
      throw new Error(`Synthetic metric cycle detected at ${metric}`);
    }

    const nextTrail = new Set(trail);
    nextTrail.add(metric);
    return nextTrail;
  }

  private toNumber(value: number | string | null | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseSources(value: string | null): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry, index, all) => entry.length > 0 && all.indexOf(entry) === index);
  }

  private uniqueStrings(values: string[]): string[] {
    return values.filter((value, index, all) => value.length > 0 && all.indexOf(value) === index);
  }

  private combineOptionalValues(current: number | undefined, incoming: number | undefined, weight: number): number | undefined {
    if (incoming === undefined) {
      return current;
    }

    return (current ?? 0) + (incoming * weight);
  }

  private minDefinedDate(values: Array<Date | undefined>): Date | undefined {
    const timestamps = values
      .filter((value): value is Date => !!value)
      .map((value) => value.getTime());

    return timestamps.length ? new Date(Math.min(...timestamps)) : undefined;
  }

  private maxDefinedDate(values: Array<Date | undefined>): Date | undefined {
    const timestamps = values
      .filter((value): value is Date => !!value)
      .map((value) => value.getTime());

    return timestamps.length ? new Date(Math.max(...timestamps)) : undefined;
  }

  private getBucketFormat(aggregation: HealthAggregation): string {
    return aggregation === 'daily'
      ? '%Y-%m-%d 00:00:00.000'
      : '%Y-%m-%d %H:00:00.000';
  }

  private mergeHealthDataPoints(
    components: Array<{ data: HealthData[]; weight: number }>,
  ): HealthData[] {
    const combined = new Map<string, HealthData & { sources: Set<string> }>();

    for (const component of components) {
      for (const datapoint of component.data) {
        const key = datapoint.date.toISOString();
        const existing = combined.get(key) ?? {
          date: datapoint.date,
          source: '',
          sources: new Set<string>(),
        };

        existing.qty = this.combineOptionalValues(existing.qty, datapoint.qty, component.weight);
        existing.Avg = this.combineOptionalValues(existing.Avg, datapoint.Avg, component.weight);
        existing.Min = this.combineOptionalValues(existing.Min, datapoint.Min, component.weight);
        existing.Max = this.combineOptionalValues(existing.Max, datapoint.Max, component.weight);
        if (datapoint.source) {
          existing.sources.add(datapoint.source);
        }
        combined.set(key, existing);
      }
    }

    return [...combined.values()]
      .sort((left, right) => left.date.getTime() - right.date.getTime())
      .map(({ sources, ...datapoint }) => ({
        ...datapoint,
        source: [...sources].join(', '),
      }));
  }

  private mergeMetricBuckets(
    components: Array<{ buckets: HealthMetricBucketDto[]; weight: number }>,
  ): HealthMetricBucketDto[] {
    const combined = new Map<string, HealthMetricBucketDto>();

    for (const component of components) {
      for (const bucket of component.buckets) {
        const key = bucket.date.toISOString();
        const existing = combined.get(key) ?? {
          date: bucket.date,
          sampleCount: 0,
        };

        existing.sampleCount += bucket.sampleCount;
        existing.sumValue = this.combineOptionalValues(existing.sumValue, bucket.sumValue, component.weight);
        existing.averageValue = this.combineOptionalValues(existing.averageValue, bucket.averageValue, component.weight);
        existing.minValue = this.combineOptionalValues(existing.minValue, bucket.minValue, component.weight);
        existing.maxValue = this.combineOptionalValues(existing.maxValue, bucket.maxValue, component.weight);
        combined.set(key, existing);
      }
    }

    return [...combined.values()].sort((left, right) => left.date.getTime() - right.date.getTime());
  }

  private async getMetricLatest(metric: string, from: Date, to: Date): Promise<MetricLatestRow | undefined> {
    const rows = await this.healthRepository.query(
      `
        SELECT
          COALESCE(Avg, qty) AS latestValue,
          date AS latestDate
        FROM health_records
        WHERE name = ?
          AND date BETWEEN ? AND ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [metric, this.toSqliteDate(from), this.toSqliteDate(to)],
    );

    return rows[0];
  }

  private async getMetricStats(metric: string, from: Date, to: Date): Promise<MetricStatsRow | undefined> {
    const rows = await this.healthRepository.query(
      `
        SELECT
          name,
          MIN(units) AS units,
          COUNT(*) AS recordCount,
          MIN(date) AS firstDate,
          MAX(date) AS lastDate,
          AVG(COALESCE(Avg, qty)) AS averageValue,
          MIN(COALESCE(Min, Avg, qty)) AS minValue,
          MAX(COALESCE(Max, Avg, qty)) AS maxValue,
          SUM(COALESCE(qty, Avg, 0)) AS totalValue,
          GROUP_CONCAT(DISTINCT source) AS sources
        FROM health_records
        WHERE name = ?
          AND date BETWEEN ? AND ?
        GROUP BY name
      `,
      [metric, this.toSqliteDate(from), this.toSqliteDate(to)],
    );

    return rows[0];
  }

  private async getMetricBuckets(
    metric: string,
    from: Date,
    to: Date,
    aggregation: HealthAggregation,
  ): Promise<HealthMetricBucketDto[]> {
    const rows: MetricBucketRow[] = await this.healthRepository.query(
      `
        SELECT
          strftime('${this.getBucketFormat(aggregation)}', date) AS bucketDate,
          COUNT(*) AS sampleCount,
          SUM(COALESCE(qty, Avg, 0)) AS sumValue,
          AVG(COALESCE(Avg, qty)) AS averageValue,
          MIN(COALESCE(Min, Avg, qty)) AS minValue,
          MAX(COALESCE(Max, Avg, qty)) AS maxValue
        FROM health_records
        WHERE name = ?
          AND date BETWEEN ? AND ?
        GROUP BY bucketDate
        ORDER BY bucketDate ASC
      `,
      [metric, this.toSqliteDate(from), this.toSqliteDate(to)],
    );

    return rows.map((row) => ({
      date: this.parseSqliteDate(row.bucketDate),
      sampleCount: Number(row.sampleCount),
      sumValue: this.toNumber(row.sumValue),
      averageValue: this.toNumber(row.averageValue),
      minValue: this.toNumber(row.minValue),
      maxValue: this.toNumber(row.maxValue),
    }));
  }

  private async buildRawMetricSummary(
    metric: string,
    from: Date,
    to: Date,
    aggregation: HealthAggregation,
  ): Promise<HealthMetricSummaryDto | undefined> {
    const stats = await this.getMetricStats(metric, from, to);
    if (!stats) {
      return undefined;
    }

    const latest = await this.getMetricLatest(metric, from, to);
    const buckets = await this.getMetricBuckets(metric, from, to, aggregation);

    return {
      name: stats.name,
      units: stats.units,
      recordCount: Number(stats.recordCount),
      firstDate: this.parseSqliteDate(stats.firstDate),
      lastDate: this.parseSqliteDate(stats.lastDate),
      latestValue: this.toNumber(latest?.latestValue),
      latestDate: latest?.latestDate ? this.parseSqliteDate(latest.latestDate) : undefined,
      averageValue: this.toNumber(stats.averageValue),
      minValue: this.toNumber(stats.minValue),
      maxValue: this.toNumber(stats.maxValue),
      totalValue: this.toNumber(stats.totalValue),
      sources: this.parseSources(stats.sources),
      buckets,
    };
  }

  private async buildMetricSummary(
    metric: string,
    from: Date,
    to: Date,
    aggregation: HealthAggregation,
    trail: MetricTrail = new Set<string>(),
  ): Promise<HealthMetricSummaryDto | undefined> {
    const syntheticMetric = getSyntheticMetricDefinition(metric);
    if (!syntheticMetric) {
      return this.buildRawMetricSummary(metric, from, to, aggregation);
    }

    const nextTrail = this.cloneTrail(metric, trail);
    const components = (await Promise.all(
      syntheticMetric.components.map(async (component) => ({
        weight: component.weight ?? 1,
        summary: await this.buildMetricSummary(component.metric, from, to, aggregation, nextTrail),
      })),
    )).filter(
      (component): component is { weight: number; summary: HealthMetricSummaryDto } => !!component.summary,
    );

    if (!components.length) {
      return undefined;
    }

    return {
      name: syntheticMetric.name,
      units: syntheticMetric.units,
      recordCount: components.reduce((sum, component) => sum + component.summary.recordCount, 0),
      firstDate: this.minDefinedDate(components.map((component) => component.summary.firstDate))!,
      lastDate: this.maxDefinedDate(components.map((component) => component.summary.lastDate))!,
      latestValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.summary.latestValue, component.weight),
        undefined,
      ),
      latestDate: this.maxDefinedDate(components.map((component) => component.summary.latestDate)),
      averageValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.summary.averageValue, component.weight),
        undefined,
      ),
      minValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.summary.minValue, component.weight),
        undefined,
      ),
      maxValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.summary.maxValue, component.weight),
        undefined,
      ),
      totalValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.summary.totalValue, component.weight),
        undefined,
      ),
      sources: this.uniqueStrings(components.flatMap((component) => component.summary.sources)),
      buckets: this.mergeMetricBuckets(
        components.map((component) => ({
          buckets: component.summary.buckets,
          weight: component.weight,
        })),
      ),
    };
  }

  private async buildRawMetricCatalogItem(metric: string): Promise<HealthMetricCatalogItemDto | undefined> {
    const rows: MetricStatsRow[] = await this.healthRepository.query(
      `
        SELECT
          name,
          MIN(units) AS units,
          COUNT(*) AS recordCount,
          MIN(date) AS firstDate,
          MAX(date) AS lastDate,
          AVG(COALESCE(Avg, qty)) AS averageValue,
          MIN(COALESCE(Min, Avg, qty)) AS minValue,
          MAX(COALESCE(Max, Avg, qty)) AS maxValue,
          SUM(COALESCE(qty, Avg, 0)) AS totalValue,
          GROUP_CONCAT(DISTINCT source) AS sources
        FROM health_records
        WHERE name = ?
        GROUP BY name
      `,
      [metric],
    );

    const stats = rows[0];
    if (!stats) {
      return undefined;
    }

    const latestRows: MetricLatestRow[] = await this.healthRepository.query(
      `
        SELECT
          COALESCE(Avg, qty) AS latestValue,
          date AS latestDate
        FROM health_records
        WHERE name = ?
        ORDER BY date DESC
        LIMIT 1
      `,
      [metric],
    );

    const latest = latestRows[0];

    return {
      name: stats.name,
      units: stats.units,
      recordCount: Number(stats.recordCount),
      firstDate: this.parseSqliteDate(stats.firstDate),
      lastDate: this.parseSqliteDate(stats.lastDate),
      latestValue: this.toNumber(latest?.latestValue),
      latestDate: latest?.latestDate ? this.parseSqliteDate(latest.latestDate) : undefined,
      sources: this.parseSources(stats.sources),
    };
  }

  private async buildMetricCatalogItem(
    metric: string,
    trail: MetricTrail = new Set<string>(),
  ): Promise<HealthMetricCatalogItemDto | undefined> {
    const syntheticMetric = getSyntheticMetricDefinition(metric);
    if (!syntheticMetric) {
      return this.buildRawMetricCatalogItem(metric);
    }

    const nextTrail = this.cloneTrail(metric, trail);
    const components = (await Promise.all(
      syntheticMetric.components.map(async (component) => ({
        weight: component.weight ?? 1,
        item: await this.buildMetricCatalogItem(component.metric, nextTrail),
      })),
    )).filter((component): component is { weight: number; item: HealthMetricCatalogItemDto } => !!component.item);

    if (!components.length) {
      return undefined;
    }

    return {
      name: syntheticMetric.name,
      units: syntheticMetric.units,
      recordCount: components.reduce((sum, component) => sum + component.item.recordCount, 0),
      firstDate: this.minDefinedDate(components.map((component) => component.item.firstDate))!,
      lastDate: this.maxDefinedDate(components.map((component) => component.item.lastDate))!,
      latestValue: components.reduce<number | undefined>(
        (value, component) => this.combineOptionalValues(value, component.item.latestValue, component.weight),
        undefined,
      ),
      latestDate: this.maxDefinedDate(components.map((component) => component.item.latestDate)),
      sources: this.uniqueStrings(components.flatMap((component) => component.item.sources)),
    };
  }

  private async buildMetricSeries(
    metric: string,
    from: Date,
    to: Date,
    trail: MetricTrail = new Set<string>(),
  ): Promise<ResolvedMetricSeries | undefined> {
    const syntheticMetric = getSyntheticMetricDefinition(metric);
    if (!syntheticMetric) {
      const records = await this.healthRepository.find({
        where: {
          name: metric,
          date: Between(from, to),
        },
        order: {
          date: 'ASC',
        },
      });

      if (!records.length) {
        return undefined;
      }

      return {
        name: metric,
        units: records[0].units,
        data: records.map((record) => this.toHealthData(record)),
      };
    }

    const nextTrail = this.cloneTrail(metric, trail);
    const components = (await Promise.all(
      syntheticMetric.components.map(async (component) => ({
        weight: component.weight ?? 1,
        series: await this.buildMetricSeries(component.metric, from, to, nextTrail),
      })),
    )).filter(
      (component): component is { weight: number; series: ResolvedMetricSeries } => !!component.series,
    );

    if (!components.length) {
      return undefined;
    }

    return {
      name: syntheticMetric.name,
      units: syntheticMetric.units,
      data: this.mergeHealthDataPoints(
        components.map((component) => ({
          data: component.series.data,
          weight: component.weight,
        })),
      ),
    };
  }

  public async importHealthData(data: RawHealthData) {
    this.log.log(`Recieved new health import at: ${new Date()}`);
    try {
      for (const metric of data.data.metrics) {
        const records = this.createHealthRecords(metric);
        await this.upsertInChunks(
          this.healthRepository,
          records,
          ['name', 'date'],
          DbHealthService.HEALTH_RECORD_COLUMN_COUNT,
        );
      }
      this.log.log('Imported health data.');
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  public async importSleepData(data: RawSleepData) {
    this.log.log(`Recieved new sleep import at: ${new Date()}`);
    try {
      const metric = data.data.metrics[0];
      const records = this.createSleepRecords(metric);
      await this.upsertInChunks(
        this.sleepRepository,
        records,
        ['value', 'startDate'],
        DbHealthService.SLEEP_RECORD_COLUMN_COUNT,
      );
      this.log.log('Imported sleep data.');
    } catch (e: any) {
      this.log.error(`Failed to import data: ${e.message}`);
      throw e;
    }
  }

  public async getHealthData(from: Date, to: Date, metrics: string[]): Promise<HealthDataDto> {
    try {
      const ret: HealthDataDto = { metrics: {} };
      for (const metric of metrics) {
        const series = await this.buildMetricSeries(metric, from, to);
        if (series) {
          ret.metrics[metric] = {
            name: series.name,
            units: series.units,
            data: series.data,
          };
        }
      }
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export health data: ${e.message}`);
      throw e;
    }
  }

  public async getHealthCatalog(): Promise<HealthCatalogDto> {
    try {
      const metricNames: Array<{ name: string }> = await this.healthRepository.query(
        `SELECT DISTINCT name FROM health_records ORDER BY name ASC`,
      );
      const metrics = (await Promise.all([
        ...metricNames.map((row) => this.buildMetricCatalogItem(row.name)),
        ...listSyntheticMetricDefinitions().map((metric) => this.buildMetricCatalogItem(metric.name)),
      ]))
        .filter((item): item is HealthMetricCatalogItemDto => !!item)
        .filter((item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index)
        .sort((left, right) => left.name.localeCompare(right.name));

      const firstRecord = metrics[0]?.firstDate
        ? new Date(Math.min(...metrics.map((metric) => metric.firstDate.getTime())))
        : undefined;
      const lastRecord = metrics[0]?.lastDate
        ? new Date(Math.max(...metrics.map((metric) => metric.lastDate.getTime())))
        : undefined;

      return {
        metrics,
        metricCount: metrics.length,
        sleepRecordCount: await this.sleepRepository.count(),
        firstRecordDate: firstRecord,
        lastRecordDate: lastRecord,
      };
    } catch (e: any) {
      this.log.error(`Failed to load health catalog: ${e.message}`);
      throw e;
    }
  }

  public async getHealthDashboard(
    from: Date,
    to: Date,
    metrics: string[],
    aggregation: HealthAggregation,
  ): Promise<HealthDashboardDto> {
    try {
      const ret: HealthDashboardDto = {
        from,
        to,
        aggregation,
        metrics: {},
      };

      for (const metric of metrics) {
        const summary = await this.buildMetricSummary(metric, from, to, aggregation);
        if (summary) {
          ret.metrics[metric] = summary;
        }
      }

      return ret;
    } catch (e: any) {
      this.log.error(`Failed to load health dashboard: ${e.message}`);
      throw e;
    }
  }

  public async getSleepData(from: Date, to: Date): Promise<SleepDataDto> {
    try {
      const ret: SleepDataDto = { data: [] };
      ret.data = await this.sleepRepository.find({
        where: {
          startDate: Between(from, to),
        },
        order: {
          startDate: 'ASC',
        },
      });
      return ret;
    } catch (e: any) {
      this.log.log(`Failed to export sleep data: ${e.message}`);
      throw e;
    }
  }
}
