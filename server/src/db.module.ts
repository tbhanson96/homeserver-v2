import { DynamicModule, ForwardReference, Logger, Module, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';
import { HealthService } from './health/health.service';
import { DbHealthService } from './health/db-health.service';
import { ConfigModule } from './config.module';
import { HealthRecord, SleepRecord } from './models/health';

@Module({})
export class DbModule {
  static forRoot(): DynamicModule {
    const imports: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference> = [ConfigModule];
    imports.push(
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          type: 'better-sqlite3',
          database: config.config.db.path,
          autoLoadEntities: true,
          synchronize: config.config.db.synchronize,
          logging: false,
          enableWAL: true,
        }),
      }),
      TypeOrmModule.forFeature([HealthRecord, SleepRecord]),
    );

    const providers = [
      {
        provide: HealthService,
        useClass: DbHealthService,
      },
      Logger,
    ];

    return {
      module: DbModule,
      imports,
      providers,
      exports: [HealthService],
    };
  }
}
