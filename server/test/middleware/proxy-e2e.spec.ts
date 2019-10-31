import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpServer } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as http from 'http';

describe('ProxyMiddleware (e2e)', () => {
  let app: INestApplication;
  let proxyServer: http.Server;

  beforeAll(async () => {
    process.env['PROXIES'] = '/proxy=http://localhost:12345';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    app = moduleFixture.createNestApplication();
    
    await app.init();
    proxyServer = http.createServer((req, res) => {
        res.writeHead(200, {'Content-type': 'text/plain'})
        res.write('Hello World!');
        res.end();
    }).listen(12345);
  });

  afterAll(async () => {
    await app.close();
    proxyServer.close();
  });

  it('GET /apps/proxy proxies request', async () => {
    const response = await request(app.getHttpServer())
      .get('/apps/proxy')
      .expect(200);
    expect(response.text).toEqual('Hello World!');
  });

});
