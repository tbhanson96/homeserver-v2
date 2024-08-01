import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, Subject, debounceTime, filter } from 'rxjs';
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

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent implements OnInit, OnDestroy {
  readonly defaultMaxFilesShown = 20;
  readonly showMoreIncrement = 20;
  files: FileData[] = [];
  reqPath: string[];
  searchQuery = '';
  isSearchOpen = false;
  showHiddenFiles = false;
  maxFilesShown = this.defaultMaxFilesShown;
  subscriptions: Subscription[];

  public get visibleFiles() {
    let ret = this.files;
    if (this.searchQuery) {
      ret = ret.filter(f => f.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
    ret = ret.slice(0, this.maxFilesShown);
    return ret;
  }
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackbar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly uiActions: UiStateActions,
    private readonly uiSelectors: UiStateSelectors,
    private readonly filesService: FilesService) { }

  ngOnInit() {
    this.uiActions.setCurrentApp('Files');
    this.subscriptions = [
      this.route.url.subscribe(parts => {
        this.uiActions.setAppBusy(true);
        this.searchQuery = '';
        this.reqPath = parts.map(p => decodeURI(p.toString()));
        this.updateFiles();
        this.uiActions.setCurrentFilesDirectory(this.joinReqPath(this.reqPath));
      }),
      this.uiSelectors.getShowHiddenFiles().subscribe(showHiddenFiles => {
        this.showHiddenFiles = showHiddenFiles;
        this.updateFiles();
      }),
    ]
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
        const progressRef = this.dialog.open(ProgressDialogComponent, { disableClose: true, data: {
          title: `Uploading file(s)..`,
          status: this.filesService.getUploadProgress(),
        }});
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
        })
      }
    });
  }

  public onShowMoreFiles() {
    this.maxFilesShown += this.showMoreIncrement;
  }

  public navigateToFileUrl(file: FileData) {
    const route = encodeURI('/home/files' + file.link);
    if (file.type === 'dir') {
      this.router.navigateByUrl(route) 
    } else {
      const origin = window.location.origin;
      window.location.assign(origin + route);
    }
  }

  public onDeleteFile(file: FileData) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: { service: UploadType.Files, file }});
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.snackbar.open(`Successfully deleted file: ${file.name}`);
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
    const dialogRef = this.dialog.open(RenameFileComponent, { data: { selectedFile: file }});
    dialogRef.afterClosed().subscribe(result => {
      if (result instanceof Observable) {
        this.uiActions.setAppBusy(true);
        result.subscribe({
          next: () => {
            this.snackbar.open(`Successfully renamed file: ${file.name}`);
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

  public onSearchClick() {
    this.isSearchOpen = !this.isSearchOpen;
    this.searchQuery = '';
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
        this.uiActions.setAppBusy(false);
      },
      error: err => {
        this.uiActions.setAppBusy(false);
        throw new Error(`Could not get directory: ${reqPathString}`);
      },
    });
  }

  private joinReqPath(reqPath: string[]): string {
    return reqPath.join('/') || '/';
  }
}
