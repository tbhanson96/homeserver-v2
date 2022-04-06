jest.mock('../../src/files/file.service');
jest.mock('express')
import { FileController } from '../../src/files/file.controller';
import { response } from 'express';
import { randomBytes } from 'crypto';
import { FileData } from '../../src/models/fileData.dto';
import { FileService } from '../../src/files/file.service';

describe('FileController', () => {

    const fileService: jest.Mock<FileService> = FileService as any;
    let controller: FileController;
    let service: FileService;
    beforeEach(() => {
        fileService.mockClear();
        controller = new FileController(new fileService()); 
        service = fileService.mock.instances[0];
    });

    describe('getPath', () => {
        it('should call getFiles', async () => {
            await controller.getPath('/');
            expect(service.getFiles).toHaveBeenCalledWith('/');
            await controller.getPath('/')
            expect(service.getFiles).toHaveBeenCalledWith('/');
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
                encoding: '',
                originalname: 'file.txt',
                mimetype: '',
                stream: {} as any,
                size: 0,
                destination: '',
                filename: 'asjdkfl',
                path: 'askl',
                buffer: randomBytes(20),
            }], '/');
            expect(service.copyFiles).toHaveBeenCalledWith(expect.anything(), '/');
        })
    })

    describe('renameFile', () => {
        it('should call moveFile', async () => {
            const myFile = new FileData({
                name: "myFile",
                link: "/path/to/myFile"
            });
            jest.spyOn(service, 'getLocalFilePath').mockImplementation(filePath => filePath);
            await controller.renameFile(myFile, 'myNewFile');
            expect(service.moveFile).toHaveBeenCalledWith(myFile, "/path/to/myNewFile");
        })
    })
});