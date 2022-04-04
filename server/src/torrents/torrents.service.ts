import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { TorrentDto } from '../models/torrent.dto';
import { AsyncUtils } from '../lib/async-utils';

export enum TorrentCategory {
    MOVIES = 'movies',
    TV = 'tv',
};

@Injectable()
export class TorrentsService {

    private token: string;
    private lastRetrievedToken: Date;
    private lastRequestTime: Date;
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly log: Logger,
    ) { }

    private async getToken() {
        const now = new Date();
        if (!this.token || now.getTime() - this.lastRetrievedToken.getTime() > 14 * 60 * 1000) {
            const response = await this.makeRequest({ get_token: 'get_token' });
            this.token = response.data.token;
            this.lastRetrievedToken = now;
            this.log.log('Retreieved new token for torrent api.');
        }
    }

    public async searchTorrents(search: string, category: TorrentCategory): Promise<TorrentDto[]> {
        const results = await this.apiRequest({
            mode: 'search',
            search_string: search,
            sort: 'seeders',
            category: category
        });
        return results;
    }

    private async apiRequest(query: any): Promise<TorrentDto[]> {
        await this.getToken();
        query.token = this.token;
        query.format = 'json_extended';
        const results = await this.makeRequest(query);
        if (results.data.torrent_results) {
            this.log.log(`Retrieved results for query: ${query.search_string}, category: ${query.category}`);
        }
        return results.data.torrent_results || [];
    }

    private async makeRequest(query: any): Promise<AxiosResponse> {
        const now = new Date();
        const diff = now.getTime() - this.lastRequestTime?.getTime() || now.getTime();
        if (diff < 4 * 1000) {
            await AsyncUtils.sleepAsync(diff);
        }
        this.lastRequestTime = new Date();
        query.app_id = 'tim_homeserver';
    
        const response = await lastValueFrom(this.httpService.get(this.configService.config.torrent.host, {
            params: query,
        }));
        return response;
    }
}
