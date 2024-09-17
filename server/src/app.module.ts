import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope, Logger } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientMiddleware } from './middlewares/client.middleware';
import { FileService } from './files/file.service';
import { ConfigService } from './config/config.service';
import { FileController } from './files/file.controller';
import { FileValidationPipe } from './files/file-validation.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { AuthController } from './auth/auth.controller';
import { EbookController } from './ebooks/ebook.controller';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { FilesMiddleware } from './middlewares/files.middleware';
import { EbookService } from './ebooks/ebook.service';
import { EbooksMiddleware } from './middlewares/ebooks.middleware';
import { BooleanPipe } from './lib/boolean-transform.pipe';
import { DatePipe } from './lib/date-transform.pipe';
import { APP_PIPE } from '@nestjs/core';
import { CalibreService } from './ebooks/calibre.service';
import { RealCalibreService } from './ebooks/real-calibre.service';
import { StubCalibreService } from './ebooks/stub-calibre.service';
import { UpdateService } from './settings/update.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { TorrentsController } from './torrents/torrents.controller';
import { TorrentsService } from './torrents/torrents.service';
import { LibgenService } from './lib/libgen.service';
import { ProxyMiddleware } from './middlewares/proxy.middleware';
import { StatusController } from './status/status.controller';
import { StatusService } from './status/status.service';
import { HealthController } from './health/health.controller';
import { ConfigModule } from './config.module';
import { DbModule } from './db.module';

@Module({
  imports: [
    ConfigModule,
    DbModule.forRoot(),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        dest: config.config.files.uploadDir,
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: Buffer.from(config.config.auth.jwtSecret),
      }),
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [
    FileController,
    AuthController,
    EbookController,
    SettingsController,
    TorrentsController,
    StatusController,
    HealthController,
  ],
  providers: [
    FileService,
    {
      provide: CalibreService,
      useFactory: async (config: ConfigService, log: Logger) => {
        if (config.config.ebooks.useCalibre) {
          return new RealCalibreService(config, log);
        } else {
          return new StubCalibreService(config, log);
        }
      },
      inject: [ConfigService, Logger],
    },
    {
      provide: FileValidationPipe,
      useClass: FileValidationPipe,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_PIPE,
      useClass: BooleanPipe,
    },
    {
      provide: APP_PIPE,
      useClass: DatePipe,
    },
    AuthService,
    EbookService,
    UpdateService,
    SettingsService,
    Logger,
    TorrentsService,
    LibgenService,
    StatusService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware, FilesMiddleware, EbooksMiddleware, ClientMiddleware)
    .forRoutes({
      path: '/**',
      method: RequestMethod.GET,
    });
  }
}
