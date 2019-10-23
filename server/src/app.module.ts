import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope } from '@nestjs/common';
import * as path from 'path';
import { AppService } from './services/app.service';
import { ClientMiddleware } from './middlewares/client.middleware';
import { FileService } from './services/file.service';
import { ConfigService } from './services/config.service';
import { FileController } from './controllers/file.controller';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [AppModule],
      useFactory: async (config: ConfigService) => ({
        dest: config.env.FILE_UPLOAD_DEST
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [
    ConfigService,
  ],
  controllers: [
    FileController,
  ],
  providers: [
    //Services
    AppService,
    FileService,
    ConfigService,
    //Pipes
    {
      provide: FileValidationPipe,
      useClass: FileValidationPipe,
      scope: Scope.REQUEST,
    },
    {
      provide: "APP_ROOT",
      useValue: path.join(__dirname, '..', '..'),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.GET,
    });
    consumer.apply()
  }
}
