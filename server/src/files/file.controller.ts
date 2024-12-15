import { Controller, Get, UsePipes, Query, Res, UseInterceptors, UploadedFiles, Post, UseGuards, Body, Delete, Put } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileValidationPipe } from './file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse, ApiQuery, ApiConsumes, ApiBody, ApiAcceptedResponse, ApiNotFoundResponse, ApiProperty } from '@nestjs/swagger';
import { FileData } from '../models/fileData.dto';
import { Response } from 'express';
import * as path from 'path'; 
import "multer";
import { JwtGuard } from '../auth/jwt.guard';

@Controller(joinRoutes(routes.api, routes.files))
@UseGuards(JwtGuard)
@UsePipes(FileValidationPipe)
export class FileController {
    constructor(
        private readonly fileService: FileService,
        ) {}

    @Get('path')
    @ApiOkResponse({type: FileData, isArray: true, description: 'Directory path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid directory path'})
    @ApiQuery({name: 'path', type: String, description: 'Path to get files from'})
    async getPath(@Query('path') filePath: string) {
        const files = await this.fileService.getFiles(filePath);
        return files;
    }

    @Get('file')
    @ApiOkResponse({ description: 'File successfully found'})
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    @ApiQuery({name: 'file', description: 'Path to file to retrieve'})
    getFile(@Query('file') filePath: string, @Res() response: Response) {
        const localPath = this.fileService.getLocalFilePath(filePath);
        response.sendFile(localPath);
    }

    @Get('file/export')
    @ApiOkResponse({
        description: 'File successfully zipped',
        content: {
            'application/zip': {
                schema: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Invalid file path'})
    @ApiQuery({name: 'path', description: 'Path to directory to download'})
    async downloadFolder(@Query('path') filePath: string, @Res() response: Response) {
        const zipped = await this.fileService.downloadFiles(filePath);
        response.sendFile(zipped);
    }

    @Post('file')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiAcceptedResponse({ description: "File(s) succesfully uploaded!"})
    @ApiQuery({name: 'path', description: 'Directory to place file'})
    @ApiBody({ type: Object })
    @ApiConsumes('multipart/form-data')
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Query('path') directory: string) {
       await this.fileService.copyFiles(files, directory);
    } 

    @Put('file')
    @ApiOkResponse({ description: "File succesfully renamed!"})
    @ApiNotFoundResponse({ description: "File not found"})
    @ApiBadRequestResponse({ description: "New path is invalid"})
    @ApiQuery({ name: 'name', description: 'Directory to place file' })
    async renameFile(@Body() file: FileData, @Query('name') name: string) {
        const newPath = path.join(path.dirname(this.fileService.getLocalFilePath(file.link)), name); 
        await this.fileService.moveFile(file, newPath);
    } 

    @Delete('file')
    @ApiOkResponse({ description: "File was successfully deleted."})
    async deleteFile(@Body() file: FileData) {
        await this.fileService.deleteFile(file);
    }
}