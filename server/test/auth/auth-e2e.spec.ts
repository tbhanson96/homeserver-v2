import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/services/config.service';
import { AuthDto } from '../../src/models/auth.dto';

describe('FileController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })

  it('POST /api/auth, GET /api/auth correctly auths', async () => {
    const config = app.get(ConfigService);
    const { text: token } = await request(app.getHttpServer())
      .post('/api/auth')
      .send(new AuthDto(config.env.APP_USER, config.env.APP_PASSWORD))
      .expect(201)
    expect(token).toBeTruthy();

    await request(app.getHttpServer())
      .get('/api/auth')
      .set('Cookie', [`access_token=${token}`])
      .expect(200);
  })

  it('GET /api/auth before login throws error', async () => {
    await request(app.getHttpServer())
      .get('/api/auth')
      .expect(401);
  })

});
