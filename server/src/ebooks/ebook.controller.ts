import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFiles, UsePipes, Delete, Body, Put, Sse, OnModuleInit, Res, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiConsumes, ApiBody, ApiAcceptedResponse } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { routes, joinRoutes } from '../routes';
import { EbookData } from '../models/ebookData.dto';
import { EbookService } from './ebook.service';
import { LibgenService } from '../lib/libgen.service';
import { LibgenData } from '../models/libgen.dto';
import { StatusService } from '../status/status.service';
import { StatusChannel, StatusType } from '../models/statusUpdate.dto';
import "multer";
import { JwtGuard } from '../auth/jwt.guard';

@Controller(joinRoutes(routes.api, routes.ebooks))
@UseGuards(JwtGuard)
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
    @ApiQuery({name: 'sendToTori', required: false, description: 'Whether or not to send this ebook to Tori instead of the default Kindle address'})
    async sendBookToKindle(@Body() book: EbookData, @Query('sendToTori') sendToTori: boolean) {
        const localPath = this.ebookService.getLocalFilePath(book);
        await this.ebookService.sendToKindle([localPath], sendToTori);
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
    @ApiQuery({name: 'sendToTori', required: false, description: 'Whether or not to send this ebook to Tori instead of the default Kindle address'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: Object })
    async addEbook(
        @UploadedFiles() files: Express.Multer.File[],
        @Query('sendToKindle') sendToKindle: boolean,
        @Query('sendToTori') sendToTori: boolean,
    ) {
        const filePaths = await this.ebookService.addBooks(files);
        if (sendToKindle || sendToTori) {
            await this.ebookService.sendToKindle(filePaths, sendToTori);
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
    @ApiQuery({name: 'sendToTori', required: false, description: 'Whether or not to send this ebook to Tori instead of the default Kindle address'})
    @ApiBody({ type: LibgenData, description: 'Libgen book to download'})
    async downloadEbook(
        @Body() book: LibgenData,
        @Query('sendToKindle') sendToKindle: boolean,
        @Query('sendToTori') sendToTori: boolean,
        @Res() response: Response
    ) {
        response.sendStatus(HttpStatus.ACCEPTED);
        // do long running operation
        const channel = StatusChannel.EbookDownload;
        await this.status.runOperation(channel, async () => {
            const path = await this.libgen.downloadBook(book, (progress, text) => {
                this.status.updateStatus(channel, {
                    channel,
                    progress,
                    text,
                    status: StatusType.InProgress,
                });
            });
            this.status.updateStatus(channel, {
                channel,
                progress: -1,
                text: `Adding ${book.title} to ebook library...`,
                status: StatusType.InProgress,
            });
            const results = await this.ebookService.addBooks([{
                originalname: `${book.title}.${book.extension}`,
                path,
            }]);
            if (sendToKindle || sendToTori) {
                this.status.updateStatus(channel, {
                    channel,
                    progress: -1,
                    text: sendToTori ? `Sending book to Tori...` : `Sending book to kindle...`,
                    status: StatusType.InProgress,
                });
                await this.ebookService.sendToKindle(results, sendToTori);
            }
        });
    }
}
