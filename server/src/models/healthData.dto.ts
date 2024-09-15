export class HealthDataDto {
  metrics: Record<string, HealthMetric>;
}

export class HealthMetric {
  name: string;
  units: string;
  data: HealthData[];
}

export class HealthData {
  qty: number;
  source: string;
  date: Date;
}