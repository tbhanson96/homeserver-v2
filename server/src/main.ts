import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { appConstants } from './constants';
import * as fs from 'fs';
import * as path from 'path';

export async function bootstrap() {
  const config = new ConfigService(appConstants.envFilePath);
  let app: INestApplication;
  if ( config.env.USE_HTTPS === 'true') {
    app = await NestFactory.create(AppModule, { 
      httpsOptions: {
        key: fs.readFileSync(path.join(config.env.SSL_FILEPATH, 'key.pem')),
        cert: fs.readFileSync(path.join(config.env.SSL_FILEPATH, 'cert.pem')),
      }
    });
  } else {
    app = await NestFactory.create(AppModule);
  }
  const document = await buildApi(app);

  SwaggerModule.setup('swagger', app, document);
  return await app.listen(app.get(ConfigService).env.PORT);
}

export async function buildApi(app?: INestApplication) {
  if (!app) {
    app = await NestFactory.create(AppModule);
  }
  const options = new DocumentBuilder()
    .setTitle('Homeserver')
    .setDescription('Api for homeserver')
    .setVersion('1.0')
    .addTag('homeserver')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  return document;
}

if (require.main === module) {
  bootstrap();
}
