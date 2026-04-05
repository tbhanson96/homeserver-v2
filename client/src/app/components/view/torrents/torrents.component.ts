import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TorrentCategory, TorrentDto } from '@api/models';
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
  public readonly TORRENTS_URL = 'https://torrent.timbhanson.com'

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
    this.snackbar.open(`Copied link for ${torrent.title} to clipboard!`, 'Close')
  }

  addTorrent(torrent: TorrentDto, category: TorrentCategory): void {
    this.uiActions.setAppBusy(true);
    this.torrentService.addTorrent(torrent.download, category).subscribe({
      next: result => {
        const label = category === 'movies' ? 'Movies' : 'TV Shows';
        const message = result.duplicate
          ? `Torrent already exists in Transmission: ${label}`
          : `Added torrent to Transmission: ${label}`;
        this.snackbar.open(message, 'Close');
        this.uiActions.setAppBusy(false);
      },
      error: err => {
        this.uiActions.setAppBusy(false);
        throw err;
      },
    });
  }

}
