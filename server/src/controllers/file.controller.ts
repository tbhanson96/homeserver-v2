import { Controller, Get, UsePipes, Query, Res, UseInterceptors, UploadedFiles, Post } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '../services/file.service';
import { FileValidationPipe } from '../pipes/file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse, ApiImplicitQuery, ApiImplicitParam, ApiConsumes, ApiImplicitBody } from '@nestjs/swagger';
import { FileData } from '../models/fileData';
import { Response } from 'express';

@Controller(joinRoutes(routes.api, routes.files))
export class FileController {
    constructor(private readonly fileService: FileService ) {}

    @Get('path')
    @UsePipes(FileValidationPipe)
    @ApiOkResponse({type: FileData, isArray: true, description: 'Directory path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid directory path'})
    @ApiImplicitQuery({name: 'path', type: String, description: 'Path to get files from'})
    @ApiImplicitQuery({name: 'includeHidden', type: Boolean, description: 'Whether or not to include hidden files, default to true', required: false })
    async getPath(@Query('path') filePath: any, @Query('includeHidden') includeHiddenFiles = true) {
        return new Promise((res, rej) => {
            res(this.fileService.getFiles(filePath, includeHiddenFiles))
        });
    }

    @Get('file')
    @UsePipes(FileValidationPipe)
    @ApiOkResponse({ description: 'File successfully found'})
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    @ApiImplicitQuery({name: 'file', description: 'Path to file to retrieve'})
    async getFile(@Query('file') filePath: any, @Res() response: Response) {
        const localPath = this.fileService.getLocalFilePath(filePath);
        response.sendFile(localPath);
    }

    @Post('file')
    @UseInterceptors(FilesInterceptor('files'))
    @ApiOkResponse({ description: "File(s) succesfully uploaded!"})
    @ApiImplicitQuery({name: 'directory', description: 'Directory to place file'})
    @ApiConsumes('multipart/form-data')
    @ApiImplicitBody({ name: 'files', type: Object })
    async uploadFiles(@UploadedFiles() files: any) {
        console.log(files);
    } 
}