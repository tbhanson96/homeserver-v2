import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FilesService } from '@services/files.service';
import { FileData } from '@api/models';
import * as validFileTypes from './valid-files';
import { UiStateActions } from '@actions/ui-state.actions';
import { UploadDialogComponent } from '@components/view/upload-dialog/upload-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { UploadType } from '../upload-dialog/upload-type';
import { RenameFileComponent } from '../rename-file/rename-file.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UiStateSelectors } from '@selectors/ui-state.selectors';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
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
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
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
          '.file-card, .list-row',
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
export class FilesComponent implements OnInit, OnDestroy {
  readonly defaultMaxFilesShown = 20;
  readonly showMoreIncrement = 20;
  viewMode: 'cards' | 'list' = 'cards';
  activeTypeFilter = '';
  suggestedFilters: { label: string; value: string }[] = [];
  files: FileData[] = [];
  filteredFiles: FileData[] = [];
  reqPath: string[] = [];
  showHiddenFiles = false;
  maxFilesShown = this.defaultMaxFilesShown;
  subscriptions: Subscription[] = [];
  readonly searchControl = new FormControl('', { nonNullable: true });
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  public get visibleFiles() {
    return this.filteredFiles.slice(0, this.maxFilesShown);
  }

  public get searchQuery() {
    return this.searchControl.value.trim();
  }

  public get hiddenResultCount() {
    return Math.max(this.filteredFiles.length - this.visibleFiles.length, 0);
  }

  public get directoryLabel() {
    return this.reqPath[this.reqPath.length - 1] || 'Home';
  }

  public get totalFolders() {
    return this.filteredFiles.filter(file => file.type === 'dir').length;
  }

  public get totalDocuments() {
    return this.filteredFiles.length - this.totalFolders;
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackbar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly uiActions: UiStateActions,
    private readonly uiSelectors: UiStateSelectors,
    private readonly filesService: FilesService,
  ) {}

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.subscriptions = [
      this.searchControl.valueChanges.pipe(
        debounceTime(120),
        distinctUntilChanged(),
      ).subscribe(() => {
        this.maxFilesShown = this.defaultMaxFilesShown;
        this.applySearch();
      }),
      this.route.url.subscribe(parts => {
        this.uiActions.setAppBusy(true);
        this.searchControl.setValue('', { emitEvent: false });
        this.reqPath = parts.map(p => decodeURI(p.toString()));
        this.updateFiles();
        this.uiActions.setCurrentFilesDirectory(this.joinReqPath(this.reqPath));
      }),
      this.uiSelectors.getShowHiddenFiles().subscribe(showHiddenFiles => {
        this.showHiddenFiles = showHiddenFiles;
        this.updateFiles();
      }),
    ];
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getRouterLinkFromDir(dir: string): string {
    const index = this.reqPath.findIndex(x => x === dir);
    return '/home/files/' + this.reqPath.slice(0, index + 1).join('/');
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(UploadDialogComponent, { data: UploadType.Files });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        const progressRef = this.dialog.open(ProgressDialogComponent, {
          disableClose: true,
          data: {
            title: `Uploading file(s)..`,
            status: this.filesService.getUploadProgress(),
          },
        });
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.updateFiles();
            progressRef.close();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
            progressRef.close();
          },
        });
      }
    });
  }

  public onShowMoreFiles() {
    this.maxFilesShown += this.showMoreIncrement;
  }

  public navigateToFileUrl(file: FileData) {
    const route = encodeURI('/home/files' + file.link);
    if (file.type === 'dir') {
      this.router.navigateByUrl(route);
    } else {
      const origin = window.location.origin;
      window.location.assign(origin + route);
    }
  }

  public onDeleteFile(file: FileData) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { service: UploadType.Files, file },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.snackbar.open(`Successfully deleted file: ${file.name}`, 'Close');
            this.updateFiles();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
            throw new Error(`Failed to delete file: ${file.name}`);
          },
        });
      }
    });
  }

  public onRenameFile(file: FileData) {
    const dialogRef = this.dialog.open(RenameFileComponent, { data: { selectedFile: file } });
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.snackbar.open(`Successfully renamed file: ${file.name}`, 'Close');
            this.updateFiles();
          },
          error: () => {
            this.uiActions.setAppBusy(false);
            throw new Error(`Failed to rename file: ${file.name}`);
          },
        });
      }
    });
  }

  public clearSearch() {
    this.searchControl.setValue('');
    this.focusSearch();
  }

  public setViewMode(mode: 'cards' | 'list') {
    this.viewMode = mode;
  }

  public setTypeFilter(filterValue: string) {
    this.activeTypeFilter = filterValue;
    this.maxFilesShown = this.defaultMaxFilesShown;
    this.applySearch();
  }

  public focusSearch() {
    queueMicrotask(() => this.searchInput?.nativeElement.focus());
  }

  public async onDownloadFolder() {
    this.uiActions.setAppBusy(true);
    const response = await this.filesService.downloadFolder(this.joinReqPath(this.reqPath));
    this.uiActions.setAppBusy(false);
    const url = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${this.reqPath[this.reqPath.length - 1] || 'home'}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private updateFiles() {
    this.maxFilesShown = this.defaultMaxFilesShown;
    const reqPathString = this.joinReqPath(this.reqPath);
    this.filesService.getDirectory(reqPathString, this.showHiddenFiles).subscribe({
      next: data => {
        for (const file of data) {
          if (!validFileTypes[file.type]) {
            file.type = 'file';
          } else {
            file.type = validFileTypes[file.type];
          }
        }
        this.files = data;
        this.updateSuggestedFilters();
        this.applySearch();
        this.uiActions.setAppBusy(false);
      },
      error: () => {
        this.uiActions.setAppBusy(false);
        throw new Error(`Could not get directory: ${reqPathString}`);
      },
    });
  }

  private applySearch() {
    const query = this.searchQuery.toLowerCase();
    this.filteredFiles = this.files.filter(file =>
      (!query ||
        file.name.toLowerCase().includes(query) ||
        file.type.toLowerCase().includes(query) ||
        file.timestamp.toLowerCase().includes(query)) &&
      (!this.activeTypeFilter || file.type.toLowerCase() === this.activeTypeFilter.toLowerCase())
    );
  }

  private updateSuggestedFilters() {
    const preferredOrder = ['dir', 'pdf', 'epub', 'jpg', 'png', 'txt', 'zip'];
    const discoveredTypes = Array.from(new Set(this.files.map(file => file.type)));
    const sortedTypes = preferredOrder
      .filter(type => discoveredTypes.includes(type))
      .concat(discoveredTypes.filter(type => !preferredOrder.includes(type)));
    this.suggestedFilters = sortedTypes.slice(0, 4).map(type => ({
      label: type === 'dir' ? 'Folders' : type.toUpperCase(),
      value: type,
    }));

    if (this.activeTypeFilter && !discoveredTypes.includes(this.activeTypeFilter)) {
      this.activeTypeFilter = '';
    }
  }

  private joinReqPath(reqPath: string[]): string {
    return reqPath.join('/') || '/';
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
