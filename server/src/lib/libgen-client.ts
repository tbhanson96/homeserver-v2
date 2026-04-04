import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Agent } from 'https';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import {
    buildLibgenDownloadLookupUrl,
    buildLibgenSearchUrl,
    extractDownloadLink,
    parseLibgenSearchResults,
} from './libgen-utils';
import { LibgenData } from '../models/libgen.dto';

const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36';

@Injectable()
export class LibgenClient {
    private readonly httpsAgent: Agent;
    private readonly searchMirrors: string[];

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
        private readonly log: Logger,
    ) {
        this.httpsAgent = new Agent({ rejectUnauthorized: false });
        this.searchMirrors = getSearchMirrorsFromConfig(this.config);
    }

    public async search(query: string): Promise<LibgenData[]> {
        for (const mirror of this.searchMirrors) {
            const searchUrl = buildLibgenSearchUrl(mirror, query);
            try {
                const { data } = await lastValueFrom(this.http.get<string>(searchUrl, {
                    httpsAgent: this.httpsAgent,
                    headers: { 'User-Agent': USER_AGENT },
                    responseType: 'text',
                }));
                const results = parseLibgenSearchResults(data, mirror);
                if (results.length) {
                    this.log.log(`Found ${results.length} LibGen result(s) for "${query}"`);
                    return results;
                }
            } catch {
                this.log.warn(`LibGen search mirror failed: ${mirror}`);
                // Try the next mirror.
            }
        }
        this.log.warn(`No LibGen results found for "${query}"`);
        return [];
    }

    public async getDownloadLink(md5: string): Promise<string> {
        for (const mirror of this.searchMirrors) {
            const url = buildLibgenDownloadLookupUrl(mirror, md5);
            try {
                const { data } = await lastValueFrom(this.http.get<string>(url, {
                    httpsAgent: this.httpsAgent,
                    headers: { 'User-Agent': USER_AGENT },
                    responseType: 'text',
                }));
                const link = extractDownloadLink(data, url);
                if (link) {
                    this.log.log(`Resolved LibGen download link for md5 ${md5}: ${link}`);
                    return link;
                }
            } catch {
                this.log.warn(`LibGen download lookup failed for md5 ${md5} on mirror ${mirror}`);
            }
        }
        this.log.warn(`Could not resolve LibGen download link for md5 ${md5}`);
        return '';
    }
}
function getSearchMirrorsFromConfig(config: ConfigService): string[] {
    const libGenConfig = config.config.ebooks.libGen as { url?: string; searchMirrors?: string[] };
    return libGenConfig.searchMirrors?.length
        ? libGenConfig.searchMirrors
        : [libGenConfig.url || 'https://libgen.li'];
}
