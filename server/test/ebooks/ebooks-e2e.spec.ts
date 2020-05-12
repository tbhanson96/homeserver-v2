jest.mock('fs', () => {
  return require('memfs').fs;
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import path from 'path';
import fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '../../src/services/config.service';
import { setupMockFs } from '../mock-helper';


describe('EbookController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const animal = path.join(__dirname, 'animal.epub');
    const alice = path.join(__dirname, 'alice.epub');
    const igp = path.join(__dirname, 'igp.epub');
    const configService = setupMockFs(animal, igp, alice); 
    fs.renameSync(animal, path.join(configService.env.EBOOK_DIR, path.basename(animal)));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ConfigService)
    .useValue(configService)
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(AuthGuard('jwt')).canActivate = () => Promise.resolve(true),

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.unmock('fs');
  })

  it('GET /api/ebooks returns correct data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ebooks')
      .expect(200)
    expect(response.body).toMatchObject(
      [
        {
          "name": "The Social Animal",
          "author": "Elliot Aronson",
          "relativeCoverPath": null,
          "description": 
            "<p class=\"description\">Newly revised and up-to-date, this edition of The Social Animal is a " +
            "brief, compelling introduction to modern social psychology. Through vivid narrative, lively presentations " +
            "of important research, and intriguing examples, Elliot Aronson probes the patterns and motives of human " +
            "behavior, covering such diverse topics as terrorism, conformity, obedience, politics, race relations, " +
            "advertising, war, interpersonal attraction, and the power of religious cults.</p>",
        },
      ]);
  });

  it('POST /api/ebooks creates files correctly', async () => {
    const rootDir = app.get(ConfigService).env.EBOOK_DIR;
    await request(app.getHttpServer())
      .post('/api/ebooks?sendToKindle=false')
      .attach('0', path.join(__dirname, 'alice.epub'))
      .attach('1', path.join(__dirname, 'igp.epub'))
      .expect(201);
    const newFiles = fs.readdirSync(rootDir);
    expect(newFiles.includes('alice.epub')).toBeTruthy();
    expect(newFiles.includes('igp.epub')).toBeTruthy();
    expect(newFiles.includes('alice.mobi')).toBeTruthy();
    expect(newFiles.includes('igp.mobi')).toBeTruthy();
  });

});
