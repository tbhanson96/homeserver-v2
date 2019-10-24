import { FileController } from '../../src/controllers/file.controller';
import { FileService } from '../../src/services/file.service';
import * as mock from 'typemoq';

describe('FileController', () => {

    let controller: FileController;
    let service: mock.IMock<FileService>;
    beforeEach(() => {
        service = mock.Mock.ofType<FileService>();
        controller = new FileController(service.object);
    });

    describe('getPath', () => {
        it('should call getFiles', async () => {
            await controller.getPath('/');
            service.verify(f => f.getFiles('/', mock.It.isAny()), mock.Times.once());
        });
    });
});