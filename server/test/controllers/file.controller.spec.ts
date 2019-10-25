jest.mock( '../../src/services/file.service');
import { FileController } from '../../src/controllers/file.controller';
import { FileService } from '../../src/services/file.service';

describe('FileController', () => {

    const fileService = <jest.Mock<FileService>>FileService;
    let controller: FileController;
    let service: any;
    beforeEach(() => {
        controller = new FileController(new fileService());
        service = fileService.mock.instances[0];
    });

    describe('getPath', () => {
        it('should call getFiles', async () => {
            await controller.getPath('/');
            expect(service.getFiles).toHaveBeenCalledWith('/', true);
        });
    });
});