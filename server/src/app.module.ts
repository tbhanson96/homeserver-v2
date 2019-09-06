import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ClientMiddleware } from './middlewares/client.middleware';

@Module({
  imports: [
    MorganModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  }
}
