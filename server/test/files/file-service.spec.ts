jest.mock( '../../src/config/config.service');
jest.mock('fs');
jest.mock('../../src/lib/file-utils');
import { FileService } from '../../src/files/file.service';
import { ConfigService } from '../../src/config/config.service';
import { FileUtils } from '../../src/lib/file-utils';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

describe('FileController', () => {

    let fileService: FileService;
    const MockConfigService = <any>ConfigService;
    const fsMock = <any>fs;

    beforeEach(() => {
        MockConfigService.mockClear();
        MockConfigService.mockImplementation(() => {
            return { config: { files: { homeDir: 'root', showHidden: false } } }
        })
        fileService = new FileService(new MockConfigService(), new Logger())
        fileService.onModuleInit();
        jest.spyOn(FileUtils, 'removeHiddenFiles').mockReturnValue(['1', '2'])
        jest.spyOn(FileUtils, 'getFileProps').mockReturnValue({})
    });

    describe('getFiles', () => {
        it ('should call correct methods', async () => {
            await fileService.getFiles('Documents');
            expect(fsMock.readdirSync).toBeCalledWith("root/Documents");
        });

        it('returns correct values', async () => {
            const res = await fileService.getFiles('Documents');
            expect(res).toMatchObject( [ { link: '/Documents/1' }, { link: '/Documents/2' } ]);
        });
    });

    describe('getLocalFilePath', () => {
        it ('returns correct value', () => {
            const res = fileService.getLocalFilePath('Documents');
            expect(res).toEqual('root/Documents');
        });
    });

    describe('copyFiles', () => {
        it ('calls correct methods', async () => {
            await fileService.copyFiles([ 
                { 
                    fieldname: '',
                    originalname: 'a.txt',
                    encoding: '',
                    mimetype: '',
                    stream: <any>{},
                    size: 0,
                    destination: '',
                    filename: 'asjdkfl',
                    path: 'a',
                    buffer: randomBytes(20),
                },
                { 
                    fieldname: '',
                    originalname: 'b.txt',
                    encoding: '',
                    mimetype: '',
                    size: 0,
                    stream: <any>{},
                    destination: '',
                    filename: 'asjdkfl',
                    path: 'b',
                    buffer: randomBytes(20),
                },
            ], 'Documents');
            expect(fsMock.copyFileSync).toHaveBeenCalledWith('a', 'root/Documents/a.txt');
            expect(fsMock.copyFileSync).toHaveBeenCalledWith('b', 'root/Documents/b.txt');
            expect(fsMock.unlinkSync).toHaveBeenCalledTimes(2);
        });
    });
});