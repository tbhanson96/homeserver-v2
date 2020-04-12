import { Controller, Get, UsePipes, Query, Res, UseInterceptors, UploadedFiles, Post, UseGuards, Body, Delete } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileValidationPipe } from './file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse, ApiImplicitQuery, ApiConsumes, ApiImplicitBody } from '@nestjs/swagger';
import { FileData } from '../models/fileData';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { BooleanPipe } from '../lib/boolean-transform.pipe';

@Controller(joinRoutes(routes.api, routes.files))
@UseGuards(AuthGuard('jwt'))
@UsePipes(FileValidationPipe)
export class FileController {
    constructor(private readonly fileService: FileService ) {}

    @Get('path')
    @ApiOkResponse({type: FileData, isArray: true, description: 'Directory path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid directory path'})
    @ApiImplicitQuery({name: 'path', type: String, description: 'Path to get files from'})
    @ApiImplicitQuery({name: 'includeHidden', type: Boolean, description: 'Whether or not to include hidden files, default to true', required: false })
    async getPath(@Query('path') filePath: string, @Query('includeHidden') includeHiddenFiles: boolean = true) {
        const files = await this.fileService.getFiles(filePath, includeHiddenFiles);
        return files;
    }

    @Get('file')
    @ApiOkResponse({ description: 'File successfully found'})
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    @ApiImplicitQuery({name: 'file', description: 'Path to file to retrieve'})
    getFile(@Query('file') filePath: string, @Res() response: Response) {
        const localPath = this.fileService.getLocalFilePath(filePath);
        response.sendFile(localPath);
    }

    @Post('file')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiOkResponse({ description: "File(s) succesfully uploaded!"})
    @ApiImplicitQuery({name: 'path', description: 'Directory to place file'})
    @ApiConsumes('multipart/form-data')
    @ApiImplicitBody({ name: 'files', type: Object })
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Query('path') directory: string) {
       await this.fileService.copyFiles(files, directory);
    } 

    @Delete('file')
    @ApiOkResponse({ description: "File was successfully deleted."})
    async deleteFile(@Body() file: FileData) {
        await this.fileService.deleteFile(file);
    }
}