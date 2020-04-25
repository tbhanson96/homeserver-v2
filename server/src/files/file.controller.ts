import { Controller, Get, UsePipes, Query, Res, UseInterceptors, UploadedFiles, Post, UseGuards, Body, Delete, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileValidationPipe } from './file-validation.pipe';
import { routes, joinRoutes } from '../routes';
import { ApiBadRequestResponse, ApiOkResponse, ApiQuery, ApiConsumes, ApiBody, ApiAcceptedResponse } from '@nestjs/swagger';
import { FileData } from '../models/fileData.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller(joinRoutes(routes.api, routes.files))
@UseGuards(AuthGuard('jwt'))
@UsePipes(FileValidationPipe)
export class FileController {
    constructor(private readonly fileService: FileService ) {}

    @Get('path')
    @ApiOkResponse({type: FileData, isArray: true, description: 'Directory path was successfully read' })
    @ApiBadRequestResponse({ description: 'Invalid directory path'})
    @ApiQuery({name: 'path', type: String, description: 'Path to get files from'})
    @ApiQuery({name: 'includeHidden', type: Boolean, description: 'Whether or not to include hidden files, default to true', required: false })
    async getPath(@Query('path') filePath: string, @Query('includeHidden') includeHiddenFiles: boolean = true) {
        const files = await this.fileService.getFiles(filePath, includeHiddenFiles);
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

    @Post('file')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiAcceptedResponse({ description: "File(s) succesfully uploaded!"})
    @ApiBadRequestResponse()
    @ApiQuery({name: 'path', description: 'Directory to place file'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: Object, description: "Form data of files" })
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Query('path') directory: string) {
        if (files.length < 1) {
            throw new BadRequestException("No files were selected.");
        } 
        await this.fileService.copyFiles(files, directory);
    } 

    @Delete('file')
    @ApiOkResponse({ description: "File was successfully deleted."})
    async deleteFile(@Body() file: FileData) {
        await this.fileService.deleteFile(file);
    }
}