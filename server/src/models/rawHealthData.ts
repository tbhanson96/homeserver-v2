import { SleepRecord } from "./health";

export type RawHealthData = {
  data: {
    metrics: RawHealthMetric[],
  }
};

export type RawHealthMetric = {
  name: string,
  units: string,
  data: RawHealthDatapoint[],
};

export type RawSleepMetric = {
  name: string,
  units: string,
  data: SleepRecord[],
};

export type RawHealthDatapoint = {
  date: Date,
  qty?: number,
  Avg?: number,
  Max?: number,
  Min?: number,
  source: string,
};

export type RawSleepData = {
  data: {
    metrics: RawSleepMetric[],
  }
}

export enum MetricType {
  HEALTH = 'health',
  SLEEP = 'sleep',
}