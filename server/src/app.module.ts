import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ClientMiddleware } from './middlewares/client.middleware';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@Module({
  imports: [
    MorganModule.forRoot(),
  ],
  controllers: [
    AppController,
    FileController,
  ],
  providers: [
    //Services
    AppService,
    FileService,
    //Pipes
    {
      provide: FileValidationPipe,
      useClass: FileValidationPipe,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('combined'),
    }
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
