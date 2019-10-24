import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClientMiddleware } from '../src/middlewares/client.middleware';

describe('AppController (e2e)', () => {
  let app: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ClientMiddleware)
    .useValue({ use: (req: Request, res: Response, next: Function) => { next() }})
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/files/file (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/files/path?path=/')
      .expect(200)
  });
});
