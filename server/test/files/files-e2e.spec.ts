jest.mock('fs', () => {
  return require('memfs').fs;
});
import path from 'path';
import fs from 'fs';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { FileController } from '../../src/files/file.controller';
import { ConfigService } from '../../src/services/config.service';
import { AuthGuard } from '@nestjs/passport';
import { getConfigService, setupMockFs } from '../mock-helper';
import { FileData } from 'src/models/fileData';

describe('FileController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    setupMockFs();
    const configService = getConfigService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ConfigService)
    .useValue(configService)
    .compile();
    app = moduleFixture.createNestApplication();
    
    app.get(AuthGuard('jwt')).canActivate = () => Promise.resolve(true);

    const rootDir = app.get(ConfigService).env.FILES_DIR;

    fs.writeFileSync(path.join(rootDir, 'test.txt'),  'this is a test file');
    fs.writeFileSync(path.join(rootDir, 'test.png'), 'this is a fake picture');
    fs.mkdirSync(path.join(rootDir, 'folder'));
    fs.writeFileSync(path.join(rootDir, 'folder', 'document.txt'), 'this is a document');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.unmock('fs');
  })

  it('GET /api/files/path?path=/folder returns correct data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/files/path?path=/folder')
      .expect(200)
    expect(response.body).toMatchObject([
      {
        "name":"document.txt",
        "type":"txt",
        "timestamp":expect.any(String),
        "size":"18 bytes",
        "permissions":expect.stringMatching(/[rwx\-]{9}/),
        "link":"/folder/document.txt"
      },
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
    
    expect(response.text).toMatch('this is a test file');
  });

  it('GET /api/files/file?file=/fake-file.fake returns 404', async () => {
    const fileController = app.get(FileController);
    const spy = jest.spyOn(fileController, 'getFile');
    await request(app.getHttpServer())
      .get('/api/files/file?file=/fake-file.fake')
      .expect(404);
    expect(spy).not.toBeCalled();
  })

  it('POST /api/files/path?/', async () => {
    const rootDir = app.get(ConfigService).env.FILES_DIR;
    fs.writeFileSync('test3.pdf', 'test pdf');
    fs.writeFileSync('test4.jpg', 'test jpg');
    await request(app.getHttpServer())
      .post('/api/files/file?path=/')
      .attach('0', 'test3.pdf')
      .attach('1', 'test4.jpg')
      .expect(201);
    const files = fs.readdirSync(rootDir);
    expect(files.includes('test3.pdf')).toBeTruthy();
    expect(files.includes('test4.jpg')).toBeTruthy();
  });

  it('DELETE /api/files/file', async () => {
    const rootDir = app.get(ConfigService).env.FILES_DIR;
    const { body: files } : { body: FileData[] } = await request(app.getHttpServer())
      .get('/api/files/path?path=/')
      .expect(200);

    const fileToDelete = files[0]; 
    await request(app.getHttpServer())
      .delete('/api/files/file')
      .send(fileToDelete)
      .expect(200);
    
    expect(fs.readdirSync(rootDir).find(f => f === fileToDelete.name)).toBeFalsy();
  });

});
