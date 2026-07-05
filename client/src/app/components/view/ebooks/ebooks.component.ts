import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { EbooksService } from '@services/ebooks.service';
import { EbookData } from '@api/models';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { Observable, Subscription } from 'rxjs';
import { UploadType } from '../upload-dialog/upload-type';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { StatusService } from '@services/status.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
    selector: 'app-ebooks',
    templateUrl: './ebooks.component.html',
    styleUrls: ['./ebooks.component.scss'],
    animations: [
        trigger('panelMotion', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(14px)' }),
                animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
        trigger('collectionMotion', [
            transition(':enter', [
                query('.ebook-card', [
                    style({ opacity: 0, transform: 'translateY(10px)' }),
                    stagger(36, [
                        animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
                    ]),
                ], { optional: true }),
            ]),
        ]),
    ],
    standalone: false
})
export class EbooksComponent implements OnInit, OnDestroy {

  ebooks: EbookData[] = [];
  filteredEbooks: EbookData[] = [];
  newspapers: EbookData[] = [];
  filteredNewspapers: EbookData[] = [];
  activeReaderBook: EbookData | null = null;
  useDarkMode = false;
  subscriptions: Subscription[] = [];
  readonly librarySearchControl = new FormControl('', { nonNullable: true });
  readonly newspaperSearchControl = new FormControl('', { nonNullable: true });
  @ViewChild('tabBar') tabs: MatTabGroup;
  @ViewChild('librarySearchInput') librarySearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('newspaperSearchInput') newspaperSearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('readerPanel') readerPanel?: ElementRef<HTMLElement>;

  public get librarySearchQuery() {
    return this.librarySearchControl.value.trim();
  }

  public get newspaperSearchQuery() {
    return this.newspaperSearchControl.value.trim();
  }

  constructor(
    private uiActions: UiStateActions,
    private uiSelectors: UiStateSelectors,
    private ebooksService: EbooksService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private status: StatusService,
    ) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Ebooks');
    this.subscriptions = [
      this.uiSelectors.getUseDarkMode().subscribe(useDarkMode => {
        this.useDarkMode = useDarkMode;
      }),
      this.librarySearchControl.valueChanges.pipe(
        debounceTime(120),
        distinctUntilChanged(),
      ).subscribe(() => this.applyLibrarySearch()),
      this.newspaperSearchControl.valueChanges.pipe(
        debounceTime(120),
        distinctUntilChanged(),
      ).subscribe(() => this.applyNewspaperSearch()),
    ];
    this.updateEbooks();
    this.updateNewspapers();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public onUploadClick() {
    const dialogRef = this.dialog.open(UploadDialogComponent, { data: UploadType.Ebooks });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.updateEbooks();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
          },
        });
      }
    });
  }

  public onDeleteEbook(file: EbookData) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { service: UploadType.Ebooks, file }});
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            const libraryName = file.library === 'newspapers' ? 'newspaper' : 'ebook';
            this.snackbar.open(`Successfully removed ${libraryName} from library: ${file.name}`, 'Close');
            if (file.library === 'newspapers') {
              this.updateNewspapers();
            } else {
              this.updateEbooks();
            }
          },
          error: () => {
            this.uiActions.setAppBusy(false);
            throw new Error(`Failed to remove ebook from library: ${file.name}`);
          },
        });
      }
    });
  }

  public onResendToKindle(file: EbookData, sendToTori = false) {
    this.ebooksService.sendToKindle(file, sendToTori).subscribe({
      next: () => {
        this.snackbar.open(`Successfully sent to Kindle: ${file.name}`, 'Close');
      },
    });
  }

  public onDownload() {
    this.tabs.selectedIndex = 0;
    this.updateEbooks();
  }

  public canReadInBrowser(ebook: EbookData) {
    return !!ebook.filePath?.toLowerCase().endsWith('.epub');
  }

  public openReader(ebook: EbookData) {
    if (!this.canReadInBrowser(ebook)) {
      return;
    }
    this.activeReaderBook = ebook;
    setTimeout(() => {
      this.readerPanel?.nativeElement.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    }, 50);
  }

  public closeReader() {
    this.activeReaderBook = null;
  }

  public clearLibrarySearch() {
    this.librarySearchControl.setValue('');
    this.focusLibrarySearch();
  }

  public clearNewspaperSearch() {
    this.newspaperSearchControl.setValue('');
    this.focusNewspaperSearch();
  }

  public focusLibrarySearch() {
    queueMicrotask(() => this.librarySearchInput?.nativeElement.focus());
  }

  public focusNewspaperSearch() {
    queueMicrotask(() => this.newspaperSearchInput?.nativeElement.focus());
  }

  private updateEbooks() {
    this.uiActions.setAppBusy(true);
    this.ebooksService.getEbooks().subscribe({
      next: ebooks => {
        this.ebooks = ebooks;
        this.applyLibrarySearch();
        this.uiActions.setAppBusy(false);
      },
      error: e => {
        this.uiActions.setAppBusy(false);
        throw e;
      },
    });
  }

  private updateNewspapers() {
    this.uiActions.setAppBusy(true);
    this.ebooksService.getNewspapers().subscribe({
      next: newspapers => {
        this.newspapers = newspapers;
        this.applyNewspaperSearch();
        this.uiActions.setAppBusy(false);
      },
      error: e => {
        this.uiActions.setAppBusy(false);
        throw e;
      },
    });
  }

  private applyLibrarySearch() {
    this.filteredEbooks = this.filterCollection(this.ebooks, this.librarySearchQuery);
  }

  private applyNewspaperSearch() {
    this.filteredNewspapers = this.filterCollection(this.newspapers, this.newspaperSearchQuery);
  }

  private filterCollection(collection: EbookData[], searchQuery: string) {
    const query = searchQuery.toLowerCase();
    const matches = (ebook: EbookData) =>
      !query ||
      ebook.name.toLowerCase().includes(query) ||
      ebook.author.toLowerCase().includes(query) ||
      (ebook.description || '').toLowerCase().includes(query);
    return collection.filter(matches);
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const isTypingTarget = !!target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    if (event.key === '/' && !isTypingTarget) {
      if (this.tabs.selectedIndex === 0) {
        event.preventDefault();
        this.focusLibrarySearch();
      } else if (this.tabs.selectedIndex === 1) {
        event.preventDefault();
        this.focusNewspaperSearch();
      }
    }

    if (event.key === 'Escape' && isTypingTarget) {
      if (this.tabs.selectedIndex === 0 && this.librarySearchQuery) {
        this.clearLibrarySearch();
      } else if (this.tabs.selectedIndex === 1 && this.newspaperSearchQuery) {
        this.clearNewspaperSearch();
      }
    }

    if (event.key === 'Escape' && !isTypingTarget && this.activeReaderBook) {
      event.preventDefault();
      this.closeReader();
    }
  }
}
