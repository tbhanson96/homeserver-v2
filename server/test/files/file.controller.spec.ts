jest.mock( '../../src/files/file.service');
jest.mock('../../src/settings/settings.service');
jest.mock('express')
import { FileController } from '../../src/files/file.controller';
import { FileService } from '../../src/files/file.service';
import { response } from 'express';
import { randomBytes } from 'crypto';
import { SettingsService } from '../../src/settings/settings.service';
import { SettingsDto } from 'src/models/settingsDto';

describe('FileController', () => {

    const fileService = <jest.Mock<FileService>>FileService;
    const settingsService = <jest.Mock<SettingsService>>SettingsService;
    let controller: FileController;
    let service: any;
    beforeEach(() => {
        fileService.mockClear();
        settingsService.mockClear();
        controller = new FileController(new fileService(), new settingsService());
        service = fileService.mock.instances[0];
        jest.spyOn(settingsService.mock.instances[0], 'getSettings').mockImplementation(() => {
            const settings: SettingsDto = {
                showHiddenFiles: false, 
            };
            return settings;
        });
    });

    describe('getPath', () => {
        it('should call getFiles', async () => {
            await controller.getPath('/');
            expect(service.getFiles).toHaveBeenCalledWith('/', false);
            await controller.getPath('/')
            expect(service.getFiles).toHaveBeenCalledWith('/', false);
        });
    });

    describe('getFile', () => {
        it('should call getLocalFilePath', () => {
            controller.getFile('/', response);
            expect(service.getLocalFilePath).toHaveBeenCalledWith('/');
            expect(response.sendFile).toHaveBeenCalled();
        });
    });

    describe('uploadFiles', () => {
        it('should call copyFiles', async () => {
            await controller.uploadFiles([{
                fieldname: '',
                originalname: 'file.txt',
                encoding: '',
                mimetype: '',
                size: 0,
                destination: '',
                filename: 'asjdkfl',
                path: 'askl',
                buffer: randomBytes(20),
            }], '/');
            expect(service.copyFiles).toHaveBeenCalledWith(expect.anything(), '/');
        })
    })
});