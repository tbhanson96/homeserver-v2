import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFiles, UsePipes, Delete, Body, Put, Sse, OnModuleInit, Res, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiConsumes, ApiBody, ApiAcceptedResponse, ApiHeader, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { routes, joinRoutes } from '../routes';
import { EbookData, EbookLibrary } from '../models/ebookData.dto';
import { EbookService } from './ebook.service';
import { LibgenService } from '../lib/libgen.service';
import { LibgenData } from '../models/libgen.dto';
import { StatusService } from '../status/status.service';
import { StatusChannel, StatusType } from '../models/statusUpdate.dto';
import "multer";
import { JwtGuard } from '../auth/jwt.guard';
import { ApiKeyGuard } from '../auth/apikey.guard';

@Controller(joinRoutes(routes.api, routes.ebooks))
export class EbookController {
    constructor(
        private readonly ebookService: EbookService,
        private readonly libgen: LibgenService,
        private readonly status: StatusService,
    ) {
    }

    @Get()
    @UseGuards(JwtGuard)
    @ApiQuery({name: 'library', required: false, enum: EbookLibrary, description: 'Library to retrieve'})
    @ApiOkResponse({type: EbookData, isArray: true, description: 'Directory path was successfully read' })
    async getBooks(@Query('library') library: EbookLibrary = EbookLibrary.Books) {
        return await this.ebookService.getEbooks(library);
    }

    @Put()
    @UseGuards(JwtGuard)
    @ApiBody({ type: EbookData, description: 'Book to send to kindle'})
    @ApiAcceptedResponse({ description: "Ebook sucessfully emailed to kindle"})
    @ApiQuery({name: 'library', required: false, enum: EbookLibrary, description: 'Library containing the document'})
    @ApiQuery({name: 'sendToTori', required: false, description: 'Whether or not to send this ebook to Tori instead of the default Kindle address'})
    async sendBookToKindle(@Body() book: EbookData, @Query('library') library: EbookLibrary, @Query('sendToTori') sendToTori: boolean) {
        const localPath = this.ebookService.getLocalFilePath(book, library);
        await this.ebookService.sendToKindle([localPath], sendToTori);
    }

    @Delete()
    @UseGuards(JwtGuard)
    @ApiQuery({name: 'library', required: false, enum: EbookLibrary, description: 'Library containing the document'})
    @ApiOkResponse({ description: 'Succesfully deleted ebook.'})
    async deleteEbook(@Body() ebook: EbookData, @Query('library') library: EbookLibrary) {
        await this.ebookService.removeBookFromLibrary(ebook, library);
    }

    @Post()
    @UseGuards(JwtGuard)
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

    @Post(routes.newspapers)
    @UseGuards(ApiKeyGuard)
    @UseInterceptors(AnyFilesInterceptor())
    @ApiAcceptedResponse({ description: 'Newspaper successfully added.' })
    @ApiUnauthorizedResponse({ description: 'A valid API key is required' })
    @ApiHeader({ name: 'x-api-key', required: true, description: 'API key for automated newspaper ingestion' })
    @ApiQuery({name: 'sendToKindle', required: false, description: 'Whether or not to send this newspaper to kindle library'})
    @ApiQuery({name: 'sendToTori', required: false, description: 'Whether or not to send this newspaper to Tori instead of the default Kindle address'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: Object })
    async addNewspaper(
        @UploadedFiles() files: Express.Multer.File[],
        @Query('sendToKindle') sendToKindle: boolean,
        @Query('sendToTori') sendToTori: boolean,
    ) {
        const filePaths = await this.ebookService.addBooks(files, EbookLibrary.Newspapers);
        if (sendToKindle || sendToTori) {
            await this.ebookService.sendToKindle(filePaths, sendToTori);
        }
    }

    @Get(routes.libgen)
    @UseGuards(JwtGuard)
    @ApiOkResponse({ type: LibgenData, isArray: true, description: 'List of books returned by search of library genesis'})
    async searchEbooks(@Query('search') search: string) {
        return await this.libgen.libgenSearch(search);
    }

    @Post(routes.libgen)
    @UseGuards(JwtGuard)
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
