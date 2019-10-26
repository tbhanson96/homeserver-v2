jest.mock( '../../src/services/config.service');
jest.mock('fs');
jest.mock('../../src/lib/file-utils');
import { FileService } from '../../src/services/file.service';
import { ConfigService } from '../../src/services/config.service';
import { FileUtils } from '../../src/lib/file-utils';
import * as fs from 'fs';

describe('FileController', () => {

    let fileService: FileService;
    const MockConfigService = <any>ConfigService;
    const fsMock = <any>fs;

    beforeEach(() => {
        MockConfigService.mockClear();
        MockConfigService.mockImplementation(() => {
            return { env: { ROOT_DIR: 'root' } }
        })
        fileService = new FileService(new (<any>ConfigService)())
        fileService.onModuleInit();
        jest.spyOn(FileUtils, 'removeHiddenFiles').mockReturnValue(['1', '2'])
        jest.spyOn(FileUtils, 'getFileProps').mockReturnValue({})
    });

    describe('getFiles', () => {
        it ('should call correct methods', async () => {
            await fileService.getFiles('Documents', false);
            expect(fsMock.readdirSync).toBeCalledWith("root/Documents");
        });

        it('returns correct values', async () => {
            const res = await fileService.getFiles('Documents', false);
            expect(res).toMatchObject( [ { link: 'Documents/1' }, { link: 'Documents/2' } ]);
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
                { originalname: 'a', path: 'a'},
                { originalname: 'b', path: 'b'}
            ], 'Documents');
            expect(fsMock.copyFileSync).toHaveBeenCalledWith('a', 'root/Documents/a');
            expect(fsMock.copyFileSync).toHaveBeenCalledWith('b', 'root/Documents/b');
            expect(fsMock.unlinkSync).toHaveBeenCalledTimes(2);
        });
    });
});