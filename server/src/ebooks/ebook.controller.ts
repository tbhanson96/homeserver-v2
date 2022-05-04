import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFiles, UsePipes, Delete, Body, Put, Sse, OnModuleInit, Res, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiConsumes, ApiBody, ApiAcceptedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { routes, joinRoutes } from '../routes';
import { EbookData } from '../models/ebookData.dto';
import { EbookService } from './ebook.service';
import { LibgenService } from '../lib/libgen.service';
import { LibgenData } from '../models/libgen.dto';
import { StatusService } from '../status/status.service';
import { StatusChannel, StatusType } from '../models/statusUpdate.dto';

@Controller(joinRoutes(routes.api, routes.ebooks))
@UseGuards(AuthGuard('jwt'))
export class EbookController {
    constructor(
        private readonly ebookService: EbookService,
        private readonly libgen: LibgenService,
        private readonly status: StatusService,
    ) {
    }

    @Get()
    @ApiOkResponse({type: EbookData, isArray: true, description: 'Directory path was successfully read' })
    async getBooks() {
        return await this.ebookService.getEbooks();
    }

    @Put()
    @ApiBody({ type: EbookData, description: 'Book to send to kindle'})
    @ApiAcceptedResponse({ description: "Ebook sucessfully emailed to kindle"})
    async sendBookToKindle(@Body() book: EbookData) {
        const localPath = this.ebookService.getLocalFilePath(book);
        await this.ebookService.sendToKindle([localPath]);
    }

    @Delete()
    @ApiOkResponse({ description: 'Succesfully deleted ebook.'})
    async deleteEbook(@Body() ebook: EbookData) {
        await this.ebookService.removeBookFromLibrary(ebook);
    }

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    @ApiAcceptedResponse({ description: "Ebook succesfully uploaded!"})
    @ApiQuery({name: 'sendToKindle', description: 'Whether or not to send this ebook to kindle library'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: Object })
    async addEbook(@UploadedFiles() files: Express.Multer.File[], @Query('sendToKindle') sendToKindle: boolean) {
        const filePaths = await this.ebookService.addBooks(files);
        if (sendToKindle) {
            await this.ebookService.sendToKindle(filePaths);
        }
    }

    @Get(routes.libgen)
    @ApiOkResponse({ type: LibgenData, isArray: true, description: 'List of books returned by search of library genesis'})
    async searchEbooks(@Query('search') search: string) {
        return await this.libgen.libgenSearch(search);
    }

    @Post(routes.libgen)
    @ApiAcceptedResponse({ description: 'Started ebook download'})
    @ApiQuery({name: 'sendToKindle', description: 'Whether or not to send this ebook to kindle library'})
    @ApiBody({ type: LibgenData, description: 'Libgen book to download'})
    async downloadEbook(@Body() book: LibgenData, @Query('sendToKindle') sendToKindle: boolean, @Res() response: Response) {
        response.sendStatus(HttpStatus.ACCEPTED);
        // do long running operation
        const channel = StatusChannel.EbookDownload;
        await this.status.runOperation(channel, async () => {
            this.status.updateStatus(channel, {
                channel,
                progress: 25,
                text: `Downloading ${book.title} from library genesis...`,
                status: StatusType.InProgress,
            });
            const path = await this.libgen.downloadBook(book);
            this.status.updateStatus(channel, {
                channel,
                progress: 50,
                text: `Adding book to library...`,
                status: StatusType.InProgress,
            });
            const results = await this.ebookService.addBooks([{
                originalname: `${book.title}.${book.extension}`,
                path,
            }]);
            this.status.updateStatus(channel, {
                channel,
                progress: 75,
                text: `Sending book to kindle...`,
                status: StatusType.InProgress,
            });
            if (sendToKindle) {
                this.ebookService.sendToKindle(results);
            }
        });
    }
}
