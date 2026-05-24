import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config/config.service';
import { AuthDto } from '../../src/models/auth.dto';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('FileController (e2e)', () => {
  let app: INestApplication;
  const authConfigPath = path.join(os.tmpdir(), `homeserver-auth-e2e-${process.pid}.json`);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    app = moduleFixture.createNestApplication();

    await app.init();
    const config = app.get(ConfigService);
    config.config.app.configOverridePath = authConfigPath;
  });

  afterAll(async () => {
    await app.close();
    fs.rmSync(authConfigPath, { force: true });
  })

  it('POST /api/auth, GET /api/auth correctly auths', async () => {
    const config = app.get(ConfigService);
    const { text: token } = await request(app.getHttpServer())
      .post('/api/auth')
      .send(new AuthDto(config.config.auth.username, config.config.auth.password))
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
