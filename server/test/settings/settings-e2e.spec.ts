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
import { getConfigService, setupMockFs } from '../mock-helper';
import { UpdateService } from '../../src/settings/update.service';
import { ConfigService } from '../../src/services/config.service';
import { SettingsService } from '../../src/settings/settings.service';
import { SettingsDto } from 'src/models/settingsDto';

describe('SettingsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const update1 = path.join(__dirname, 'update1.tar.gz');
    const update2 = path.join(__dirname, 'update2.tar.gz');
    setupMockFs(update1, update2);
    const configService = getConfigService();
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
  })

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

  it('GET /api/settings/update trims available packages', async () => {
    const config = app.get(ConfigService);
    // create too many updates so they get trimmed
    const maxUpdates = parseInt(config.env.UPDATES_LIMIT);
    for (let i = 0; i < maxUpdates + 2; i++) {
      fs.writeFileSync(path.join(config.env.UPDATES_DIR, `someupdate${i}.tar.gz`), 'random data');
    }
    const response = await request(app.getHttpServer())
      .get('/api/settings/update')
      .expect(200)
    expect(response.body.length).toEqual(maxUpdates);
  });


  it('POST /api/settings', async() => {
    const settingsService = app.get(SettingsService);
    const newSettings: SettingsDto = {
      useDarkMode: true,
      showHiddenFiles: true,
    };
    await request(app.getHttpServer())
      .post('/api/settings')
      .send(newSettings)
      .expect(201);
    
    expect(settingsService.getSettings()).toMatchObject(newSettings);
  });

  it('GET /api/settings', async () => {
    const settingsService = app.get(SettingsService);
    const settings = settingsService.getSettings();
    const { body: retrievedSettings }: { body: SettingsDto } = await request(app.getHttpServer())
      .get('/api/settings')
      .expect(200);
    
    expect(retrievedSettings).toMatchObject(settings);
  });

});
