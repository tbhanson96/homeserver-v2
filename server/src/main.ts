import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

declare const module: any;

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = await buildApi(app);

  SwaggerModule.setup('swagger', app, document);
  return await app.listen(3000);
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
