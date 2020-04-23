import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { routes, joinRoutes } from '../routes';
import { ApiOkResponse, ApiConsumes, ApiAcceptedResponse, ApiQuery } from '@nestjs/swagger';
import { EbookData } from '../models/ebookData.dto';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { EbookService } from './ebook.service';
import { ApiFiles } from '../lib/api-file-decorator';

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
    @ApiQuery({name: 'sendToKindle', description: 'Whether or not to send this ebook to kindle library'})
    @ApiConsumes('multipart/form-data')
    @ApiFiles()
    async addEbook(@UploadedFiles() files: Express.Multer.File[], @Query('sendToKindle') sendToKindle: boolean) {
        const filePaths = await this.ebookService.addBooks(files);
        if (sendToKindle) {
            await this.ebookService.sendToKindle(filePaths);
        }
    }
}
