import { Controller, Get, UsePipes, Query} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller(joinRoutes(routes.api, routes.files))
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Get('path')
    @UsePipes(FileValidationPipe)
    @ApiOkResponse({ description: 'File path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    async getPath(@Query('path') filePath: any) {
        return new Promise((res, rej) => {
            res(this.fileService.getFiles(filePath))
        });
    }
}