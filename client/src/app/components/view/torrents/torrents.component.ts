import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit } from '@angular/core';
import { TorrentDto } from '@api/models';
import { TorrentsService } from '@services/torrents.service';

@Component({
  selector: 'app-torrents',
  templateUrl: './torrents.component.html',
  styleUrls: ['./torrents.component.scss']
})
export class TorrentsComponent implements OnInit {

  public query: string;
  public torrents: TorrentDto[];
  public categoryOptions = ['movies', 'tv'];
  public selectedCategory = this.categoryOptions[0];

  constructor(
    private readonly torrentService: TorrentsService,
    private readonly uiActions: UiStateActions,
  ) { }

  ngOnInit(): void {
    this.uiActions.setCurrentApp('Torrents');
  }

  onTorrentSearch(): void {
    this.uiActions.setAppBusy(true);
    const results = this.torrentService.queryTorrents(this.query, this.selectedCategory).subscribe(
      {
        next: torrents => {
          this.torrents = torrents;
          this.uiActions.setAppBusy(false);
        },
        error: err => {
          this.uiActions.setAppBusy(false);
          throw err;
        }
      }
    )
  }

}
