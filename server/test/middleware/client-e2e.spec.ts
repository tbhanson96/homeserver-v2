import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpServer } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('ClientMiddleware (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['CLIENT_DIR'] = __dirname; 
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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
