import { Logger, Module } from '@nestjs/common'
import { ConfigService } from './config/config.service';

@Module({
  providers: [ConfigService, Logger],
  exports: [ConfigService],
})
export class ConfigModule { }