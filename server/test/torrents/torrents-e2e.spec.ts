jest.mock('fs', () => {
  return require('memfs').fs;
});
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '@nestjs/passport';
import { setupMockFs } from '../mock-helper';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { TorrentDto } from 'models/torrent.dto';

describe('FileController (e2e)', () => {
  let app: INestApplication;
  let dto: TorrentDto;

  beforeAll(async () => {
    setupMockFs();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(HttpService)
    .useValue({
      get: (url: string, config: any) => {
        return new Observable(subscriber => {
          subscriber.next({
            status: 200,
            statusText: '',
            headers: {},
            config: {},
            data: {
              torrent_results: [
                dto,
              ]
            }
          });
          subscriber.complete();
        });
      }
    })
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(AuthGuard('jwt')).canActivate = () => Promise.resolve(true);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.unmock('fs');
  })

  it('GET /api/torrent/?query returns calls rargb', async () => {
    const title = 'the office';
    const seeders = 14;
    dto = {
      title,
      seeders,
      leechers: 0,
      download: '',
      category: 'movies',
      size: 3000,
    };
    const response = await request(app.getHttpServer())
      .get('/api/torrent?search=office&category=movies')
      .expect(200)
    expect(response.body).toMatchObject([dto]);
  });

});
