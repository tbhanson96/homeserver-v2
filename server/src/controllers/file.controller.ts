import { Controller, Get, UsePipes, Query} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse, ApiImplicitQuery } from '@nestjs/swagger';
import { FileData } from '../models/fileData';

@Controller(joinRoutes(routes.api, routes.files))
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Get('path')
    @UsePipes(FileValidationPipe)
    @ApiOkResponse({type: FileData, isArray: true, description: 'File path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    @ApiImplicitQuery({name: 'path', description: 'Path to get files from'})
    async getPath(@Query('path') filePath: any) {
        return new Promise((res, rej) => {
            res(this.fileService.getFiles(filePath))
        });
    }
}