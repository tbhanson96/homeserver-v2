import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { BooleanPipe } from './lib/boolean-transform.pipe';

export async function bootstrap() {
  const config = new ConfigService();
  let app: INestApplication;
  if ( config.config.app.useHttps) {
    app = await NestFactory.create(AppModule, { 
      httpsOptions: {
        key: fs.readFileSync(config.config.ssl.keyPath),
        cert: fs.readFileSync(config.config.ssl.certPath),
      }
    });
  } else {
    app = await NestFactory.create(AppModule);
  }
  const document = await buildApi(app);

  if (app.get(ConfigService).config.app.serveSwagger) {
    SwaggerModule.setup('swagger', app, document);
  }
  if (!app.get(ConfigService).config.app.requireAuth) {
    app.get(AuthGuard('jwt')).canActivate = async () => true;
  }
  return await app.listen(app.get(ConfigService).config.app.port);
}

export async function buildApi(app?: INestApplication) {
  if (!app) {
    app = await NestFactory.create(AppModule);
  }
  const options = new DocumentBuilder()
    .setTitle('Homeserver')
    .setDescription('Api for homeserver')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  return document;
}

if (require.main === module) {
  bootstrap();
}
