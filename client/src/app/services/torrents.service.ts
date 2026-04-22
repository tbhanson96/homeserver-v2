import { Injectable } from '@angular/core';
import { TorrentsService as GeneratedTorrentsService } from '@api/services';
import { TorrentCategory } from '@api/models';

@Injectable({
  providedIn: 'root'
})
export class TorrentsService {

  constructor(
    private readonly torrentsApi: GeneratedTorrentsService,
  ) { }

  public queryTorrents(query: string, category: any) {
    return this.torrentsApi.torrentsControllerQueryTorrents({ search: query, category })
  }

  public addTorrent(magnet: string, category: TorrentCategory) {
    return this.torrentsApi.torrentsControllerAddTorrent({
      body: {
        magnet,
        category,
      },
    });
  }
}
