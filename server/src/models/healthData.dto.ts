import { ApiProperty, ApiExtraModels} from '@nestjs/swagger';
import { SleepType } from './health';

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

export class SleepDataDto {
  data: SleepData[];
}
