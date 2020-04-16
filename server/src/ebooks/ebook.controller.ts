import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFiles, UsePipes } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiOkResponse, ApiImplicitQuery, ApiConsumes, ApiImplicitBody, ApiAcceptedResponse } from '@nestjs/swagger';
import { EbookData } from '../models/ebookData';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { EbookService } from './ebook.service';

@Controller(joinRoutes(routes.api, routes.ebooks))
@UseGuards(AuthGuard('jwt'))
export class EbookController {
    constructor(
        private readonly ebookService: EbookService,
        ) { }

    @Get()
    @ApiOkResponse({type: EbookData, isArray: true, description: 'Directory path was successfully read' })
    async getBooks() {
        return await this.ebookService.getEbooks();
    }

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    @ApiAcceptedResponse({ description: "Ebook succesfully uploaded!"})
    @ApiImplicitQuery({name: 'sendToKindle', description: 'Whether or not to send this ebook to kindle library'})
    @ApiConsumes('multipart/form-data')
    @ApiImplicitBody({name: 'files' , type: Object })
    async addEbook(@UploadedFiles() files: Express.Multer.File[], @Query('sendToKindle') sendToKindle: boolean) {
        const filePaths = await this.ebookService.addBooks(files);
        if (sendToKindle) {
            await this.ebookService.sendToKindle(filePaths);
        }
    }
}
