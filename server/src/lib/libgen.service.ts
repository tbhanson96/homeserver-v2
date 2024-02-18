import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import fs from 'fs';
import path from 'path';
const libgen = require('libgen');
import { ConfigService } from '../config/config.service';
import { LibgenData } from '../models/libgen.dto';
import { Agent } from 'https';

@Injectable()
export class LibgenService {
    /**
     * Temporary workaround since library.lol domain cert is expired. when the renew,
     * remove this code.
     */
    private httpsAgent: Agent;

    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly log: Logger,
    ) { 
        this.httpsAgent = new Agent({ rejectUnauthorized: false });
    }

    public async libgenSearch(searchQuery: string): Promise<LibgenData[]> {
        const results: any[] = await libgen.search({
            mirror: this.config.config.ebooks.libGen.url,
            query: searchQuery,
        });
        const ret: LibgenData[] = [];
        if (!results.length) {
            return ret;
        }
        results?.forEach(result => {
            ret.push({
                title: result.title,
                author: result.author,
                year: parseInt(result.year),
                pages: parseInt(result.pages),
                filesize: parseInt(result.filesize),
                extension: result.extension,
                md5: result.md5,
                coverUrl: 
                    result.coverurl ?
                    `/proxy/covers/${result.coverurl}`
                    : '',
            });
        });
        return ret;
    }

    public async downloadBook(book: LibgenData): Promise<string> {
        const link = await this.getDownloadLink(book.md5);
        if (!link) {
            throw new NotFoundException(`Could not find book download link for ${book.title}`);
        }
        try {
            const response = await lastValueFrom(this.http.get(
                link,
                {
                    responseType: 'stream',
                    httpsAgent: this.httpsAgent,
                }
            ));
            const filePath = path.join(this.config.config.files.uploadDir, `${book.title}.${book.extension}`);
            await fs.promises.writeFile(
                filePath,
                response.data,
            );
            return filePath;
        } catch (e) {
            this.log.error(`Could not download book from link: ${link}`);
            throw e;
        }
    }

    private async getDownloadLink(bookMd5: string): Promise<string> {
        const { data }: { data: string } = await lastValueFrom(this.http.get(
            `${this.config.config.ebooks.libGen.downloadUrl}/${bookMd5}`
        ));
        if (data) {
            const link = data.match(/(?<=href=").+(?=">)/);
            const ret =  link?.at(0) || '';
            console.log(ret);
            return ret;
        }
        else return '';
    }
    
}
