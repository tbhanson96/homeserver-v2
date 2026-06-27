export type SyntheticMetricComponent = {
  metric: string;
  weight?: number;
};

export type SyntheticMetricDefinition = {
  name: string;
  units: string;
  components: SyntheticMetricComponent[];
};

const SYNTHETIC_METRICS: SyntheticMetricDefinition[] = [
  {
    name: 'total_energy',
    units: 'kcal',
    components: [
      { metric: 'basal_energy_burned' },
      { metric: 'active_energy' },
    ],
  },
];

const SYNTHETIC_METRICS_BY_NAME = new Map(
  SYNTHETIC_METRICS.map((metric) => [metric.name, metric]),
);

export function getSyntheticMetricDefinition(name: string): SyntheticMetricDefinition | undefined {
  return SYNTHETIC_METRICS_BY_NAME.get(name);
}

export function listSyntheticMetricDefinitions(): SyntheticMetricDefinition[] {
  return [...SYNTHETIC_METRICS];
}
