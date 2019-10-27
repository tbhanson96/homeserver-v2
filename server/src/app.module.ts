import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope } from '@nestjs/common';
import * as path from 'path';
import { ClientMiddleware } from './middlewares/client.middleware';
import { FileService } from './files/file.service';
import { ConfigService } from './services/config.service';
import { FileController } from './files/file.controller';
import { FileValidationPipe } from './files/file-validation.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PassportModule, AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwtstrategy';

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
  ],
  providers: [
    FileService,
    {
      provide: ConfigService,
      useValue: new ConfigService(path.join(__dirname, '..', 'env'))
    },
    {
      provide: FileValidationPipe,
      useClass: FileValidationPipe,
      scope: Scope.REQUEST,
    },
    AuthService,
    JwtStrategy,
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
