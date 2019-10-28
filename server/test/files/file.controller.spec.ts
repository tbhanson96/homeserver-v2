jest.mock( '../../src/files/file.service');
jest.mock('express')
import { FileController } from '../../src/files/file.controller';
import { FileService } from '../../src/files/file.service';
import { response } from 'express';

describe('FileController', () => {

    const fileService = <jest.Mock<FileService>>FileService;
    let controller: FileController;
    let service: any;
    beforeEach(() => {
        fileService.mockClear();
        controller = new FileController(new fileService());
        service = fileService.mock.instances[0];
    });

    describe('getPath', () => {
        it('should call getFiles', async () => {
            await controller.getPath('/');
            expect(service.getFiles).toHaveBeenCalledWith('/', true);
            await controller.getPath('/', false)
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
            await controller.uploadFiles({ file1: "file1", file2: "file2"}, '/');
            expect(service.copyFiles).toHaveBeenCalledWith(expect.anything(), '/');
        })
    })
});