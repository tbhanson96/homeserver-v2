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
import path from 'path';
import { readFileSync } from 'fs';
import { JwtGuard } from '../../src/auth/jwt.guard';
import { TransmissionService } from '../../src/torrents/transmission.service';
import { TorrentCategory } from '../../src/torrents/torrents.service';

describe('FileController (e2e)', () => {
  let app: INestApplication;
  let dto: TorrentDto;
  const transmissionResult = {
    id: 42,
    name: 'Example Torrent',
    hashString: 'hash-123',
    downloadDir: '/downloads/Movies',
    duplicate: false,
  };

  beforeAll(async () => {
    const mockPirateBay = path.join(__dirname, 'piratebay.html');
    setupMockFs(mockPirateBay);

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
            data: readFileSync(mockPirateBay, { encoding: 'utf-8' }),
          });
          subscriber.complete();
        });
      }
    })
    .overrideProvider(TransmissionService)
    .useValue({
      addMagnet: jest.fn().mockImplementation((magnet: string, category: TorrentCategory) => {
        return Promise.resolve({
          ...transmissionResult,
          downloadDir: category === TorrentCategory.TV ? '/downloads/TV Shows' : '/downloads/Movies',
        });
      }),
    })
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(JwtGuard).canActivate = () => Promise.resolve(true);

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
      download: 'download link',
      category: 'Video',
      size: '165.73 GiB',
    };
    const response = await request(app.getHttpServer())
      .get('/api/torrent?search=office&category=movies')
      .expect(200)
    expect(response.body).toMatchObject([dto]);
  });

  it('POST /api/torrent adds torrent to transmission', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/torrent')
      .send({
        magnet: 'magnet:?xt=urn:btih:test',
        category: 'movies',
      })
      .expect(201);

    expect(response.body).toEqual(transmissionResult);
  });

});
