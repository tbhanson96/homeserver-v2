export type RawHealthData = {
  data: {
    metrics: RawHealthMetric[],
  }
};

type RawHealthMetric = {
  name: string,
  units: string,
  data: RawHealthDatapoint[],
};

type RawHealthDatapoint = {
  date: Date,
  qty: number,
  source: string,
};