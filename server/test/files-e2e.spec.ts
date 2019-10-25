import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FileController } from '../src/controllers/file.controller';

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

  it('GET /api/files/path?path=/Documents returns correct data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/files/path?path=/Documents')
      .expect(200)
    expect(response.body).toMatchObject([
      {
        "name":"1000_SW_RX_Append_CDMA_1xEV-DO.pdf",
        "type":"pdf",
        "timestamp":expect.any(String),
        "size":"857.61 kB",
        "permissions":expect.stringMatching(/[rwx\-]{9}/),
        "link":"/Documents/1000_SW_RX_Append_CDMA_1xEV-DO.pdf"
      },
      {
        "name": "bigDir/",
        "type":"dir",
        "timestamp":expect.any(String),
        "size":expect.any(String),
        "permissions":expect.stringMatching(/[rwx\-]{9}/),
        "link":"/Documents/bigDir"
      }
    ]);
  });

  it('GET /api/files/path?path=/invalid/path returns 404', () => {
    const fileController = app.get(FileController);
    const spy = jest.spyOn(fileController, 'getPath');
    request(app.getHttpServer())
      .get('/api/files/path?path=/invalid/path')
      .expect(404);
    expect(spy).not.toBeCalled();
  });

  it('GET /api/files/file?file=/test.txt returns correct data', async () => {
    const response = await request(app.getHttpServer())
    .get('/api/files/file?file=/test.txt')
    .expect(200);
    
    expect(response.text).toMatch('this is a test file.');
  });

  it('GET /api/files/file?file=/fake-file.fake returns 404', () => {
    const fileController = app.get(FileController);
    const spy = jest.spyOn(fileController, 'getFile');
    request(app.getHttpServer())
      .get('/api/files/file?file=/fake-file.fake')
      .expect(404);
    expect(spy).not.toBeCalled();
  })

});
