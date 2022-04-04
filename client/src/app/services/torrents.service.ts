import { Injectable } from '@angular/core';
import { ApiService } from '@api/services';

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
}
