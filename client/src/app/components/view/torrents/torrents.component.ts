import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TorrentDto } from '@api/models';
import { TorrentsService } from '@services/torrents.service';

@Component({
  selector: 'app-torrents',
  templateUrl: './torrents.component.html',
  styleUrls: ['./torrents.component.scss']
})
export class TorrentsComponent implements OnInit {

  public query: string;
  public torrents: TorrentDto[] = [];
  public categoryOptions = ['movies', 'tv'];
  public selectedCategory = this.categoryOptions[0];

  constructor(
    private readonly torrentService: TorrentsService,
    private readonly uiActions: UiStateActions,
    private readonly snackbar: MatSnackBar,
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

  navigateToUrl(url: string): void {
    window.location.assign(url);
  }

  async copyLinkToClipboard(torrent: TorrentDto): Promise<void> {
    await navigator.clipboard?.writeText(torrent.download);
    this.snackbar.open(`Copied link for ${torrent.title} to clipboard!`)
  }

}
