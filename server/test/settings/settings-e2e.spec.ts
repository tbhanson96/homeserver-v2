jest.mock('fs', () => {
  return require('memfs').fs;
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { setupMockFs } from '../mock-helper';
import { UpdateService } from '../../src/settings/update.service';
import { ConfigService } from '../../src/services/config.service';

describe('SettingsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const update1 = path.join(__dirname, 'update1.tar.gz');
    const update2 = path.join(__dirname, 'update2.tar.gz');
    const configService = setupMockFs(update1, update2);
    fs.renameSync(update1, path.join(configService.env.UPDATES_DIR, 'update1.tar.gz'));
    fs.renameSync(update2, path.join(configService.env.UPDATES_DIR, 'update2.tar.gz'));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(AuthGuard('jwt')).canActivate = () => Promise.resolve(true),

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })


  it('GET /api/settings/update returns correct information', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/settings/update')
      .expect(200)
    expect(response.body).toMatchObject([
      'update1.tar.gz',
      'update2.tar.gz',
    ]);
  });

  it('POST /api/settings/update applies update', async () => {
    const updateService = app.get(UpdateService);
    const spy = jest.spyOn(updateService, 'shutdownApplication').mockImplementation(async () => { });
    await request(app.getHttpServer())
      .post('/api/settings/update?update=update1.tar.gz')
      .expect(201);
    
    expect(spy).toBeCalled();
    const install = fs.readdirSync(app.get(ConfigService).env.INSTALL_DIR);
    expect(install.includes('client')).toBeTruthy();
    expect(install.includes('server')).toBeTruthy();
    expect(install.includes('env')).toBeTruthy();
  });

});
