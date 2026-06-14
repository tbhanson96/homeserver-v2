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
import { ConfigService } from '../../src/config/config.service';
import { SettingsService } from '../../src/settings/settings.service';
import { SettingsDto } from '../../src/models/settings.dto';
import jsonfile from 'jsonfile';
import { JwtGuard } from '../../src/auth/jwt.guard';

describe('SettingsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const update1 = path.join(__dirname, 'update1.tar.gz');
    const update2 = path.join(__dirname, 'update2.tar.gz');
    setupMockFs(update1, update2);
    const configService = new ConfigService();
    fs.renameSync(update1, path.join(configService.config.updates.updatesDir, 'update1.tar.gz'));
    fs.renameSync(update2, path.join(configService.config.updates.updatesDir, 'update2.tar.gz'));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(JwtGuard).canActivate = () => Promise.resolve(true),

    await app.init();
  });

  afterAll(async () => {
    jest.unmock('fs');
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

  it('POST /api/settings/update exits process and writes config', async () => {
    const config = app.get(ConfigService).config;
    const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    config.app.configOverridePath = 'config.json';
    jest.useFakeTimers();

    await request(app.getHttpServer())
      .post('/api/settings/update')
      .expect(201);
    
    jest.advanceTimersToNextTimer();
    await Promise.resolve();
    const writtenConfig = await jsonfile.readFile('config.json');
    expect(writtenConfig).toEqual(config);
    expect(exit).toHaveBeenCalledWith(0);
    exit.mockRestore();
    jest.useRealTimers();
  });

  it('GET /api/settings/update trims available packages', async () => {
    const config = app.get(ConfigService);
    // create too many updates so they get trimmed
    const maxUpdates = config.config.updates.limit;
    for (let i = 0; i < maxUpdates + 2; i++) {
      fs.writeFileSync(path.join(config.config.updates.updatesDir, `someupdate${i}.tar.gz`), 'random data');
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
