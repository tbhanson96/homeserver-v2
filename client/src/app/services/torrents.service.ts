import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';
import { TorrentCategory } from '@api/models';

@Injectable({
  providedIn: 'root'
})
export class TorrentsService {

  constructor(
    private readonly api: ApiService,
  ) { }

  public queryTorrents(query: string, category: any) {
    return this.api.torrentsControllerQueryTorrents({ search: query, category })
  }

  public addTorrent(magnet: string, category: TorrentCategory) {
    return this.api.torrentsControllerAddTorrent({
      body: {
        magnet,
        category,
      },
    });
  }
}
