import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { ConfigService } from '../config/config.service';
import { LibgenData } from '../models/libgen.dto';
import { LibgenClient } from './libgen-client';

@Injectable()
export class LibgenService {
    constructor(
        private readonly config: ConfigService,
        private readonly client: LibgenClient,
        private readonly log: Logger,
        private readonly http: HttpService,
    ) {}

    public async libgenSearch(searchQuery: string): Promise<LibgenData[]> {
        const results = await this.client.search(searchQuery);
        return results.filter(result => result.extension === 'epub');
    }

    public async downloadBook(
        book: LibgenData,
        onProgress?: (progress: number, text: string) => void,
    ): Promise<string> {
        const link = await this.client.getDownloadLink(book.md5);
        if (!link) {
            throw new NotFoundException(`Could not find book download link for ${book.title}`);
        }

        try {
            const response = await this.http.axiosRef.get(link, {
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            });
            const filePath = path.join(
                this.config.config.files.uploadDir,
                `${sanitizeFileName(book.title)}.${book.extension}`,
            );
            const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
            let downloadedBytes = 0;

            if (onProgress && totalBytes > 0) {
                onProgress(0, `Downloading ${book.title} from library genesis...`);
            }

            response.data.on('data', (chunk: Buffer) => {
                if (!onProgress || totalBytes <= 0) {
                    return;
                }

                downloadedBytes += chunk.length;
                const progress = Math.min(Math.round((downloadedBytes / totalBytes) * 100), 100);
                onProgress(progress, `Downloading ${book.title} from library genesis... ${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`);
            });

            await pipeline(response.data, fs.createWriteStream(filePath));
            return filePath;
        } catch (e) {
            this.log.error(`Could not download book from link: ${link}`);
            throw e;
        }
    }
}

function sanitizeFileName(value: string): string {
    return value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').trim() || 'download';
}

function formatBytes(value: number): string {
    if (value < 1024) {
        return `${value} B`;
    }
    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }
    if (value < 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
