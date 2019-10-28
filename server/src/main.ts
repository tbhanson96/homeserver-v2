import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { appConstants } from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';

export async function bootstrap() {
  const config = new ConfigService(appConstants.envFilePath);
  let app: INestApplication;asdf
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

  if (app.get(ConfigService).env.SERVE_SWAGGER === 'true') {
    SwaggerModule.setup('swagger', app, document);
  }
  if (app.get(ConfigService).env.REQUIRE_AUTH === 'false') {
    app.get(AuthGuard('jwt')).canActivate = () => Promise.resolve(true);
  }
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
    .build();

  const document = SwaggerModule.createDocument(app, options);
  return document;
}

if (require.main === module) {
  bootstrap();
}
