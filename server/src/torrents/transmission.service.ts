import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { TorrentCategory } from './torrents.service';

type TransmissionArgs = Record<string, unknown>;

interface TransmissionRpcRequest {
    method: string;
    arguments?: TransmissionArgs;
}

interface TransmissionRpcResponse {
    result: string;
    arguments?: {
        'torrent-added'?: TransmissionTorrent;
        'torrent-duplicate'?: TransmissionTorrent;
    };
}

interface TransmissionTorrent {
    id?: number;
    name?: string;
    hashString?: string;
}

export interface TransmissionAddResult {
    id?: number;
    name?: string;
    hashString?: string;
    downloadDir: string;
    duplicate: boolean;
}

@Injectable()
export class TransmissionService {
    private readonly defaultRpcUrl = 'http://127.0.0.1:9091/transmission/rpc';
    private readonly sessionHeader = 'X-Transmission-Session-Id';
    private readonly downloadDirs: Record<TorrentCategory, string> = {
        [TorrentCategory.MOVIES]: '/downloads/Movies',
        [TorrentCategory.TV]: '/downloads/TV Shows',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly log: Logger,
    ) {}

    public getDownloadDir(category: TorrentCategory): string {
        const downloadDir = this.downloadDirs[category];
        if (!downloadDir) {
            throw new BadRequestException(`Unsupported torrent category: ${category}`);
        }
        return downloadDir;
    }

    public async addMagnet(magnet: string, category: TorrentCategory): Promise<TransmissionAddResult> {
        if (!magnet?.trim()) {
            throw new BadRequestException('Magnet link is required.');
        }

        const downloadDir = this.getDownloadDir(category);
        const response = await this.callRpc({
            method: 'torrent-add',
            arguments: {
                filename: magnet,
                paused: false,
                'download-dir': downloadDir,
            },
        });

        const added = response.arguments?.['torrent-added'];
        const duplicate = response.arguments?.['torrent-duplicate'];
        const torrent = added || duplicate;

        if (!torrent) {
            throw new InternalServerErrorException('Transmission did not return torrent metadata.');
        }

        return {
            id: torrent.id,
            name: torrent.name,
            hashString: torrent.hashString,
            downloadDir,
            duplicate: !!duplicate,
        };
    }

    private async callRpc(request: TransmissionRpcRequest): Promise<TransmissionRpcResponse> {
        const config = this.makeRequestConfig();
        let sessionId = '';

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await lastValueFrom(this.httpService.post<TransmissionRpcResponse>(
                    this.getRpcUrl(),
                    request,
                    {
                        ...config,
                        headers: {
                            ...(config.headers || {}),
                            ...(sessionId ? { [this.sessionHeader]: sessionId } : {}),
                        },
                    },
                ));

                if (response.data.result !== 'success') {
                    throw new InternalServerErrorException(`Transmission RPC failed: ${response.data.result}`);
                }

                return response.data;
            } catch (error: any) {
                const nextSessionId = error?.response?.headers?.[this.sessionHeader.toLowerCase()];
                if (error?.response?.status === 409 && nextSessionId && attempt === 0) {
                    sessionId = nextSessionId;
                    this.log.log('Retrying Transmission RPC request with refreshed session id.');
                    continue;
                }
                this.log.error('Failed to communicate with Transmission RPC.');
                throw error;
            }
        }

        throw new InternalServerErrorException('Transmission RPC request failed.');
    }

    private getRpcUrl(): string {
        return this.configService.config.transmission?.url || this.defaultRpcUrl;
    }

    private makeRequestConfig(): AxiosRequestConfig {
        const username = this.configService.config.transmission?.username;
        const password = this.configService.config.transmission?.password;

        if (username && password) {
            return {
                auth: {
                    username,
                    password,
                },
            };
        }

        return {};
    }
}
