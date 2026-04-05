import { Observable } from 'rxjs';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../../src/config/config.service';
import { TorrentCategory } from '../../src/torrents/torrents.service';
import { TransmissionService } from '../../src/torrents/transmission.service';

describe('TransmissionService', () => {
    const makeObservable = (factory: () => any) => new Observable(subscriber => {
        try {
            subscriber.next(factory());
            subscriber.complete();
        } catch (error) {
            subscriber.error(error);
        }
    });

    const makeConfig = (transmission = {}) => ({
        config: {
            transmission,
        },
    }) as unknown as ConfigService;

    it('maps torrent categories to fixed download directories', () => {
        const service = new TransmissionService(
            makeConfig(),
            {} as HttpService,
            new Logger(),
        );

        expect(service.getDownloadDir(TorrentCategory.MOVIES)).toEqual('/downloads/Movies');
        expect(service.getDownloadDir(TorrentCategory.TV)).toEqual('/downloads/TV Shows');
    });

    it('retries with transmission session id and returns added torrent data', async () => {
        const post = jest.fn()
            .mockImplementationOnce((_url: string, _body: any, _config: any) => makeObservable(() => {
                throw {
                    response: {
                        status: 409,
                        headers: {
                            'x-transmission-session-id': 'session-123',
                        },
                    },
                };
            }))
            .mockImplementationOnce((_url: string, _body: any, config: any) => makeObservable(() => ({
                data: {
                    result: 'success',
                    arguments: {
                        'torrent-added': {
                            id: 42,
                            name: 'Example Torrent',
                            hashString: 'hash-123',
                        },
                    },
                },
                status: 200,
                statusText: 'OK',
                headers: config.headers,
                config,
            })));

        const service = new TransmissionService(
            makeConfig({
                url: 'http://localhost:9091/transmission/rpc',
                username: 'user',
                password: 'pass',
            }),
            { post } as unknown as HttpService,
            new Logger(),
        );

        const result = await service.addMagnet('magnet:?xt=urn:btih:test', TorrentCategory.TV);

        expect(post).toHaveBeenCalledTimes(2);
        expect(post.mock.calls[1][2].headers['X-Transmission-Session-Id']).toEqual('session-123');
        expect(post.mock.calls[1][2].auth).toEqual({ username: 'user', password: 'pass' });
        expect(result).toEqual({
            id: 42,
            name: 'Example Torrent',
            hashString: 'hash-123',
            downloadDir: '/downloads/TV Shows',
            duplicate: false,
        });
    });
});
