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
    const FileUtilsMock = <any>FileUtils;
    let configService: any;

    beforeEach(() => {
        MockConfigService.mockClear();
        fsMock.mockClear();
        FileUtilsMock.mockClear();
        fileService = new FileService(new (<any>ConfigService)())
        configService = MockConfigService.mock.instances[0];
    });

    describe('getFiles', async () => {
        (<jest.Mock>fsMock.readdirSync).mockImplementation(dir => [ { file: "file1" }, { file2: "file2"} ]);
        
    })
});