import { UiStateActions } from '@actions/ui-state.actions';
import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LibgenData } from '@api/models';
import { ProgressDialogComponent } from '@components/view/progress-dialog/progress-dialog.component';
import { EbooksService } from '@services/ebooks.service';
import { StatusService } from '@services/status.service';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-libgen',
  templateUrl: './libgen.component.html',
  styleUrls: ['./libgen.component.scss'],
  animations: [
    trigger('panelMotion', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('collectionMotion', [
      transition(':enter', [
        query(
          '.search-card',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(36, [
              animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class LibgenComponent {

  query = '';
  books: LibgenData[] = [];
  @Output('download') downloadEvent = new EventEmitter();

  constructor(
    private readonly ebookService: EbooksService,
    private readonly uiActions: UiStateActions,
    private readonly dialog: MatDialog,
    private readonly status: StatusService,
  ) { }

  onLibgenSearch() {
    this.uiActions.setAppBusy(true);
    this.ebookService.searchForBooks(this.query).subscribe({
      next: books => {
        this.books = books;
        this.uiActions.setAppBusy(false);
      },
      error: err => {
        this.uiActions.setAppBusy(false);
        throw err;
      }
    });
  }

  onDownloadBook(book: LibgenData, sendToKindle: boolean, sendToTori: boolean) {
    this.uiActions.setAppBusy(true);
    const ref = this.dialog.open(ProgressDialogComponent, { disableClose: true, data: {
      title: `Downloading ${book.title}`,
      status: this.status.getChannelStatus('EbookDownload'),
      initialText: `Preparing download for ${book.title}...`,
    }});

    ref.afterClosed().subscribe(result => {
      this.uiActions.setAppBusy(false);
      if (result === 'Done') {
        this.downloadEvent.emit(null);
      }
    });

    this.ebookService.downloadBook(book, sendToKindle, sendToTori).subscribe({
      next: () => {},
      error: e => {
        ref.close('Failed');
        throw e;
      }
    });
  }

}
