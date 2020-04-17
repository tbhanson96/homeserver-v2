import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import path from 'path';
import fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '../../src/services/config.service';


describe('EbookController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

  it('GET /api/ebooks returns correct data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ebooks')
      .expect(200)
    expect(response.body).toMatchObject(
      [
        {
          "name": "The Social Animal",
          "author": "Elliot Aronson",
          "relativeCoverPath": "ebooks/Elliot Aronson/The Social Animal (1)/cover.jpg",
          "description": 
            "<p class=\"description\">Newly revised and up-to-date, this edition of The Social Animal is a " +
            "brief, compelling introduction to modern social psychology. Through vivid narrative, lively presentations " +
            "of important research, and intriguing examples, Elliot Aronson probes the patterns and motives of human " +
            "behavior, covering such diverse topics as terrorism, conformity, obedience, politics, race relations, " +
            "advertising, war, interpersonal attraction, and the power of religious cults.</p>",
        },
        {
          "name": "The Geography of Bliss: One Grump's Search for the Happiest Places in the World",
          "author": "Eric Weiner",
          "relativeCoverPath": "ebooks/Eric Weiner/The Geography of Bliss_ One Grump's Search for the Happiest Places in the World (13)/cover.jpg",
          "description": "Part foreign affairs discourse, part humor, and part twisted self-help guide, " +
          "The Geography of Bliss takes the reader from America to Iceland to India in search of happiness, " +
          "or, in the crabby author's case, moments of 'un-unhappiness.' The book uses a beguiling mixture " +
          "of travel, psychology, science and humor to investigate not what happiness is, but where it is. Are " +
          "people in Switzerland happier because it is the most democratic country in the world? Do citizens " +
          "of Singapore benefit psychologically by having their options limited by the government? Is the King " +
          "of Bhutan a visionary for his initiative to calculate Gross National Happiness? Why is Asheville, " +
          "North Carolina so damn happy? With engaging wit and surprising insights, Eric Weiner answers those " +
          "questions and many others, offering travelers of all moods some interesting new ideas for sunnier " +
          "destinations and dispositions.",
        }
      ]);
  });

  it('POST /api/ebooks creates files correctly', async () => {
    const rootDir = app.get(ConfigService).env.EBOOK_DIR;
    const initialFiles = fs.readdirSync(rootDir);
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
    fs.unlinkSync(path.join(rootDir, 'alice.epub'));
    fs.unlinkSync(path.join(rootDir, 'igp.epub'));
    fs.unlinkSync(path.join(rootDir, 'alice.mobi'));
    fs.unlinkSync(path.join(rootDir, 'igp.mobi'));
    expect(fs.readdirSync(rootDir)).toEqual(initialFiles);
  });

});
