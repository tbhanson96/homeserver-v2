jest.mock('fs', () => {
  return require('memfs').fs;
});
import path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpServer } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupMockFs } from '../mock-helper';
import { ConfigService } from '../../src/config/config.service';

describe('ClientMiddleware (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const file1 = path.join(__dirname, 'client-file.txt');
    const index = path.join(__dirname, 'index.html');
    setupMockFs(file1, index);
    const configService = new ConfigService();
    configService.config.app.clientDir = __dirname;
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ConfigService)
    .useValue(configService)
    .compile();
    app = moduleFixture.createNestApplication();
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns index.html', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200);
    expect(response.text).toEqual('<h1>Hello World!</h1>');
  });

  it('GET /test.txt returns test.txt', async() => {
      const response = await request(app.getHttpServer())
      .get('/client-file.txt')
      .expect(200);
    expect(response.text).toEqual('client file');
  })

});
