import { ApiProperty, ApiExtraModels} from '@nestjs/swagger';

export class HealthMetric {
  name: string;
  units: string;
  data: HealthData[];
}

export class HealthData {
  qty?: number;
  Avg?: number;
  Max?: number;
  Min?: number;
  source: string;
  date: Date;
}

@ApiExtraModels(HealthMetric, HealthData)
export class HealthDataDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/HealthMetric'
    }
  })
  metrics: Record<string, HealthMetric>;
}
