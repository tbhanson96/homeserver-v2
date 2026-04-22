import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UiStateActions } from '@actions/ui-state.actions';
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
export class EbooksComponent implements OnInit {

  ebooks: EbookData[] = [];
  filteredEbooks: EbookData[] = [];
  subscriptions: Subscription[] = [];
  readonly searchControl = new FormControl('', { nonNullable: true });
  @ViewChild('tabBar') tabs: MatTabGroup;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  public get searchQuery() {
    return this.searchControl.value.trim();
  }

  constructor(
    private uiActions: UiStateActions,
    private ebooksService: EbooksService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private status: StatusService,
    ) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Ebooks');
    this.subscriptions = [
      this.searchControl.valueChanges.pipe(
        debounceTime(120),
        distinctUntilChanged(),
      ).subscribe(() => this.applySearch()),
    ];
    this.updateEbooks();
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
            this.snackbar.open(`Successfully remove ebook from libary: ${file.name}`, 'Close');
            this.updateEbooks();
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
    this.ebooksService.sendToKindle(file, sendToTori).subscribe();
  }

  public onDownload() {
    this.tabs.selectedIndex = 0;
    this.updateEbooks();
  }

  public clearSearch() {
    this.searchControl.setValue('');
    this.focusSearch();
  }

  public focusSearch() {
    queueMicrotask(() => this.searchInput?.nativeElement.focus());
  }

  private updateEbooks() {
    this.uiActions.setAppBusy(true);
    this.ebooksService.getEbooks().subscribe({
      next: ebooks => {
        this.ebooks = ebooks;
        this.applySearch();
        this.uiActions.setAppBusy(false);
      },
      error: e => {
        this.uiActions.setAppBusy(false);
        throw e;
      },
    });
  }

  private applySearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredEbooks = this.ebooks.filter(ebook =>
      !query ||
      ebook.name.toLowerCase().includes(query) ||
      ebook.author.toLowerCase().includes(query) ||
      (ebook.description || '').toLowerCase().includes(query)
    );
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
      event.preventDefault();
      this.focusSearch();
    }

    if (event.key === 'Escape' && this.searchQuery && isTypingTarget) {
      this.clearSearch();
    }
  }
}
