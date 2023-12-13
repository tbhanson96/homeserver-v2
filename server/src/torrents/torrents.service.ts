import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { lastValueFrom } from 'rxjs';
import { TorrentDto } from '../models/torrent.dto';
import { load } from 'cheerio';

export enum TorrentSource {
    PIRATE_BAY = 'pirateBay',
};

export enum TorrentCategory {
    MOVIES = 'movies',
    TV = 'tv',
};


@Injectable()
export class TorrentsService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly log: Logger,
    ) { }

    /**
     * Search for torrents given category and source. Default to pirate bay.
     */
    public async searchTorrents(search: string, category: TorrentCategory): Promise<TorrentDto[]> {
        return await this.searchPiratebay(search);
    }

    /**
     * Handle queries to pirate bay
     */
    public async searchPiratebay(query: string): Promise<TorrentDto[]> {
        const url = `https://thehiddenbay.com/search/${query}/1/99/0`;
        const rawResult = await this.makeRequest(url);
        const ret: TorrentDto[] = [];

        const $ = load(rawResult);

        $("table#searchResult tr").each((_, element) => {
            const data = $(element).find('font.detDesc').text().replace(/(Size|Uploaded)/gi, '').replace(/ULed/gi, 'Uploaded').split(',').map(value => value.trim());
            const date = data[0]
            const size = data[1]
            const uploader = $(element).find('font.detDesc a').text()
    
            const torrent: TorrentDto = {
                title: $(element).find('a.detLink').text(),
                size,
                category: $(element).find('td.vertTh center a').eq(0).text(),
                seeders: parseInt($(element).find('td').eq(2).text()),
                leechers: parseInt($(element).find('td').eq(3).text()),
                download: $(element).find("td div.detName").next().attr('href') || '',
            }
    
            if (torrent.download) {
                ret.push(torrent);
            }
        });
        return ret;
    }

    private async makeRequest(url: string): Promise<string> {
        try {
            this.log.log(`Making request from torrent service to url: ${url}`);
            const result = await lastValueFrom(this.httpService.get(url));
            return result.data;
        } catch (e: any) {
            this.log.error(`Failed to make request to URL: ${url} from torrents service.`);
            throw e;
        }
    }
}
