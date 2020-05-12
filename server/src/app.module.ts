import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope, Logger } from '@nestjs/common';
import { ClientMiddleware } from './middlewares/client.middleware';
import { FileService } from './files/file.service';
import { ConfigService } from './services/config.service';
import { FileController } from './files/file.controller';
import { FileValidationPipe } from './files/file-validation.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { appConstants } from './constants';
import { AuthController } from './auth/auth.controller';
import { EbookController } from './ebooks/ebook.controller';
import { AuthService } from './auth/auth.service';
import { PassportModule, AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwtstrategy';
import { FilesMiddleware } from './middlewares/files.middleware';
import { ProxyMiddleware } from './middlewares/proxy.middleware';
import { EbookService } from './ebooks/ebook.service';
import { EbooksMiddleware } from './middlewares/ebooks.middleware';
import { BooleanPipe } from './lib/boolean-transform.pipe';
import { APP_PIPE } from '@nestjs/core';
import { CalibreService } from './ebooks/calibre.service';
import { RealCalibreService } from './ebooks/real-calibre.service';
import { StubCalibreService } from './ebooks/stub-calibre.service';
import { UpdateService } from './settings/update.service';
import { SettingsController } from './settings/settings.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [AppModule],
      useFactory: async (config: ConfigService) => ({
        dest: config.env.FILE_UPLOAD_DEST
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.env.JWT_SECRET,
        signOptions: { expiresIn: config.env.SESSION_TIMEOUT },
      }),
      inject: [ConfigService],
    })
  ],
  exports: [
    ConfigService,
  ],
  controllers: [
    FileController,
    AuthController,
    EbookController,
    SettingsController,
  ],
  providers: [
    FileService,
    {
      provide: ConfigService,
      useValue: new ConfigService(appConstants.envFilePath),
    },
    {
      provide: CalibreService,
      useFactory: async (config: ConfigService, log: Logger) => {
        if (config.env.USE_CALIBRE === 'true') {
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
    AuthService,
    EbookService,
    UpdateService,
    JwtStrategy,
    Logger,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FilesMiddleware, EbooksMiddleware, ClientMiddleware)
    .forRoutes({
      path: '/**',
      method: RequestMethod.GET,
    });
    consumer.apply(ProxyMiddleware).forRoutes({
      path: appConstants.proxyRoute,
      method: RequestMethod.ALL,
    });
  }
}
