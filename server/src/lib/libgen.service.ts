import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from 'config/config.service';
import { LibgenData } from 'models/libgen.dto';
const libgen = require('libgen');

@Injectable()
export class LibgenService {
    constructor(
        private readonly config: ConfigService,
        private readonly log: Logger,
    ) { }

    public async libgenSearch(searchQuery: string): Promise<LibgenData[]> {
        const results: any[] = await libgen.search({
            mirror: this.config.config.ebooks.libGen.url,
            query: searchQuery,
        });
        const ret: LibgenData[] = [];
        results?.forEach(result => {
            ret.push({
                title: result.title,
                author: result.author,
                year: parseInt(result.year),
                pages: parseInt(result.pages),
                filesize: parseInt(result.filesize),
                extension: result.extension,
                download: `${this.config.config.ebooks.libGen.url}/book/index.php?md5=${result.md5.toLowerCase()}`,
            })
        });
        return ret;
    }
    
}
