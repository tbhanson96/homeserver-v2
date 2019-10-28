import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from './services/config.service';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = await buildApi(app);

  if (app.get(ConfigService).env.SERVE_SWAGGER === 'true') {
    SwaggerModule.setup('swagger', app, document);
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
