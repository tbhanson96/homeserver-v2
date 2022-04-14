import { UiStateActions } from '@actions/ui-state.actions';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LibgenData } from '@api/models';
import { EbooksService } from '@services/ebooks.service';

@Component({
  selector: 'app-libgen',
  templateUrl: './libgen.component.html',
  styleUrls: ['./libgen.component.scss']
})
export class LibgenComponent implements OnInit {

  query: string;
  books: LibgenData[] = [];
  @Output('download') downloadEvent = new EventEmitter();

  constructor(
    private readonly ebookService: EbooksService,
    private readonly uiActions: UiStateActions,
  ) { }

  ngOnInit(): void {

  }

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

  onDownloadBook(book: LibgenData, sendToKindle: boolean) {
    this.uiActions.setAppBusy(true);
    this.ebookService.downloadBook(book, sendToKindle).subscribe({
      next: () => {
        this.uiActions.setAppBusy(false);
        this.downloadEvent.emit(null);
      },
      error: e => {
        this.uiActions.setAppBusy(false);
        throw e;
      }
    });
  }

}
