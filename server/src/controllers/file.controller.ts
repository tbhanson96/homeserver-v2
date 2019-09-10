import { Controller, Get, Query, Res } from '@nestjs/common';
import { FileService } from '../services/file.service';
import { routes, joinRoutes } from '../routes';

@Controller(joinRoutes(routes.api, routes.files))
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Get()
    async getDirectory(@Query('directory') directory: string) {
        return this.fileService.getFiles(directory);
    }
}
