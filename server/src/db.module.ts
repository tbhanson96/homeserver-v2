import { DynamicModule, Module, Logger, } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './config/config.service';
import { HealthRecord, HealthSchema, SleepRecord, SleepSchema } from './models/health';
import { HealthService } from './health/health.service';
import { JsonHealthService } from './health/json-health.service';
import { DbHealthService } from './health/db-health.service';
import { ConfigModule } from './config.module';

@Module({})
export class DbModule {
  static forRoot(): DynamicModule {

    const tempConfig = new ConfigService();

    let modules: DynamicModule[]  = [];
    if (!tempConfig.config.db.mock) {
      modules.push(...[
        MongooseModule.forRootAsync({
          useFactory: async (config: ConfigService) => ({
            dbName: config.config.db.name,
            uri: `mongodb://${config.config.db.host}:${config.config.db.port}`,
          }),
          imports: [ConfigModule],
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          {
            name: HealthRecord.name,
            schema: HealthSchema,
          },
          {
            name: SleepRecord.name,
            schema: SleepSchema,
          }
        ]),
      ]) ;
    }
    const providers = modules.flatMap(m => m.providers || []);

    if (tempConfig.config.db.mock) {
      providers.push({
        provide: HealthService,
        useClass: JsonHealthService,
      });
    } else {
      providers.push({
        provide: HealthService,
        useClass: DbHealthService,
      });
    }
    return {
      module: DbModule,
      imports: [
        ...modules,
        ConfigModule,
      ],
      providers: [
        ...providers,
        Logger,
      ],
      exports: [
        ...modules.flatMap(m => m.exports || []),
        HealthService,
      ],
    }
  }
}